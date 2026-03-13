import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    
    
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const totalRevenue = await prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { totalAmount: true }
    })

    const totalSales = await prisma.order.count({
      where: { status: "PAID" }
    })

    const totalUsers = await prisma.user.count({
      where: { role: "MEMBER" }
    })

    const totalBooks = await prisma.book.count()

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { book: { select: { title: true } } } }
      }
    })

    return NextResponse.json({
      stats: {
        revenue: Number(totalRevenue._sum.totalAmount || 0),
        sales: totalSales,
        users: totalUsers,
        books: totalBooks
      },
      recentOrders: recentOrders.map((o: any) => ({
        id: o.id,
        customer: o.user.name,
        amount: Number(o.totalAmount),
        status: o.status,
        date: o.createdAt.toLocaleDateString()
      }))
    })
  } catch (error: any) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
