import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userDownloads = await prisma.download.findMany({
      where: { userId: session.user.id },
      include: {
        book: true
      },
      orderBy: { grantedAt: 'desc' }
    })

    const books = userDownloads.map(d => d.book)

    return NextResponse.json(books)
  } catch (error) {
    console.error("My Library fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 })
  }
}
