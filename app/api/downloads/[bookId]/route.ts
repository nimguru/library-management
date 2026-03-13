import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getSignedDownloadUrl } from "@/lib/r2"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const download = await prisma.download.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id!,
          bookId: params.bookId
        }
      },
      include: { book: true }
    })

    if (!download) {
      return NextResponse.json({ error: "Unauthorized or not purchased" }, { status: 403 })
    }

    // Generate signed URL
    const url = await getSignedDownloadUrl(download.book.fileKey)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Download URL generation error:", error)
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 })
  }
}
