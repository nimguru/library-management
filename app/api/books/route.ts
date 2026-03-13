import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { bookSchema } from "@/lib/validations"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const genre = searchParams.get("genre")

    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 20)

    const books = await prisma.book.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { author: { contains: query, mode: 'insensitive' } },
            ]
          } : {},
          genre ? { genres: { has: genre } } : {},
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true, title: true, author: true, isbn: true,
        genres: true, description: true, coverUrl: true,
        price: true, isFree: true, publishedYear: true,
        pageCount: true, language: true, createdAt: true,
      }
    })

    return NextResponse.json(books)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = bookSchema.parse(body)

    const book = await prisma.book.create({
      data: {
        title: validatedData.title,
        author: validatedData.author,
        description: validatedData.description,
        price: validatedData.price,
        isFree: validatedData.isFree,
        coverUrl: validatedData.coverUrl || null,
        genres: validatedData.genres,
        language: validatedData.language || "en",
        pageCount: validatedData.pageCount || null,
        fileKey: validatedData.fileKey || "pending-upload",
      },
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 })
  }
}
