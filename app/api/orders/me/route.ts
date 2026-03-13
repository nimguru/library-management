import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            book: {
              select: {
                title: true,
                coverUrl: true,
                author: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      date: order.createdAt.toLocaleDateString(),
      status: order.status,
      total: Number(order.totalAmount),
      items: order.items.map((item: any) => ({
        id: item.bookId,
        title: item.book.title,
        author: item.book.author,
        coverUrl: item.book.coverUrl,
        price: Number(item.price)
      }))
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error("User orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
