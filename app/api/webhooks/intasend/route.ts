import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    // IntaSend Webhook Payload Structure:
    // {
    //   "invoice": { "id": "INV-..." },
    //   "state": "COMPLETE",
    //   "api_ref": "ORDER_ID_FROM_OUR_DB"
    // }

    if (payload.state !== 'COMPLETE') {
      return NextResponse.json({ message: "Payment not completed" })
    }

    const orderId = payload.api_ref
    const intasendRef = payload.invoice?.id

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status === 'PAID') {
      return NextResponse.json({ message: "Order already processed" })
    }

    // Mark order as PAID and create download access records in a transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID', intasendRef: intasendRef || order.intasendRef }
      }),
      ...order.items.map(item =>
        prisma.download.upsert({
          where: {
            userId_bookId: {
              userId: order.userId,
              bookId: item.bookId
            }
          },
          create: {
            userId: order.userId,
            bookId: item.bookId
          },
          update: {} // No update needed if already exists
        })
      )
    ])

    return NextResponse.json({ message: "Payment processed successfully" })
  } catch (error) {
    console.error("Webhook Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
