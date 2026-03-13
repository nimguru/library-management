import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { intasend } from "@/lib/intasend"
import { NextResponse } from "next/server"
import { orderSchema as orderCreateSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { bookIds, phoneNumber } = orderCreateSchema.parse(body)

    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } }
    })

    if (books.length === 0) {
      return NextResponse.json({ error: "No valid books found" }, { status: 400 })
    }

    if (books.length !== bookIds.length) {
      return NextResponse.json({ error: "One or more books could not be found" }, { status: 400 })
    }

    const existingDownloads = await prisma.download.findMany({
      where: {
        userId: session.user.id!,
        bookId: { in: bookIds }
      }
    })

    if (existingDownloads.length > 0) {
      return NextResponse.json(
        { error: "You already own some of these books", bookIds: existingDownloads.map(d => d.bookId) },
        { status: 400 }
      )
    }

    const total = books.reduce((sum: number, book: any) => sum + Number(book.price), 0)
    const isFree = total === 0

    const orderId = `FREE-${Date.now()}` // Temporary reference for free orders

    // If free, create order as PAID, grant downloads immediately and return success URL
    if (isFree) {
      const order = await prisma.order.create({
        data: {
          userId: session.user.id!,
          totalAmount: total,
          status: "PAID",
          items: {
            create: books.map((book: any) => ({
              bookId: book.id,
              price: book.price
            }))
          }
        }
      })
      await prisma.download.createMany({
        data: books.map((book: any) => ({
          userId: session.user.id!,
          bookId: book.id,
        })),
        skipDuplicates: true
      })

      return NextResponse.json({ 
        url: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${order.id}`,
        orderId: order.id 
      })
    }

    // Create IntaSend invoice/checkout for paid orders
    try {
      // First try to initiate payment with IntaSend
      const checkout = await intasend.collection().charge({
        first_name: session.user.name?.split(' ')[0] || 'User',
        last_name: session.user.name?.split(' ')[1] || 'Name',
        email: session.user.email,
        phone_number: phoneNumber,
        amount: total,
        currency: 'KES',
        api_ref: `TEMP-${Date.now()}`, // Temporary reference
        redirect_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
      })

      // If successful, create the order in pending state
      const order = await prisma.order.create({
        data: {
          userId: session.user.id!,
          totalAmount: total,
          status: "PENDING",
          intasendRef: checkout.id,
          items: {
            create: books.map((book: any) => ({
              bookId: book.id,
              price: book.price
            }))
          }
        }
      })

      return NextResponse.json({ 
        url: checkout.url,
        orderId: order.id 
      })
    } catch (intasendError: any) {
      console.error("IntaSend Error:", intasendError)
      return NextResponse.json({ error: "Payment gateway error" }, { status: 502 })
    }

  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Order Creation Error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
