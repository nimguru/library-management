import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-intasend-signature")
    if (!signature && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    const payloadText = await req.text()
    
    // Verify signature if we have a secret and we're in production (or if signature is present in dev)
    if (process.env.INTASEND_WEBHOOK_SECRET && signature) {
      const hmac = crypto.createHmac('sha256', process.env.INTASEND_WEBHOOK_SECRET)
      hmac.update(payloadText)
      const calculatedSignature = hmac.digest('hex')
      
      if (calculatedSignature !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const payload = JSON.parse(payloadText)

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
      console.warn("Webhook received for unknown orderId:", orderId)
      return NextResponse.json({ message: "Order not found, ignoring" }, { status: 200 })
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
