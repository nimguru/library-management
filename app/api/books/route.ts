import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { bookSchema } from "@/lib/validations"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const genre = searchParams.get("genre")

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
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(books)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    // @ts-ignore
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
        language: validatedData.language,
        pageCount: validatedData.pages || null,
        fileKey: "pending-upload", // Should be updated after actual upload or handled by client
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
