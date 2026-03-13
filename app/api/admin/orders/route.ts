import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const query = searchParams.get("q")

    const orders = await prisma.order.findMany({
      where: {
        ...(status && status !== "ALL" ? { status: status as any } : {}),
        ...(query ? {
          OR: [
            { id: { contains: query, mode: 'insensitive' } },
            { user: { name: { contains: query, mode: 'insensitive' } } },
            { user: { email: { contains: query, mode: 'insensitive' } } }
          ]
        } : {})
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          include: {
            book: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
      customer: order.user.name,
      email: order.user.email,
      date: order.createdAt.toLocaleDateString(),
      status: order.status,
      total: Number(order.totalAmount),
      items: order.items.length,
      paymentMethod: order.status === "PAID" ? "IntaSend" : order.totalAmount > 0 ? "Pending" : "Free"
    }))

    return NextResponse.json(formattedOrders)
  } catch (error: any) {
    console.error("Admin orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
