import { auth } from "@/lib/auth"
import { r2 } from "@/lib/r2"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { filename, contentType } = await req.json()

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 })
    }

    const fileKey = `${randomUUID()}-${filename}`
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })

    const publicUrl = process.env.R2_CUSTOM_DOMAIN 
      ? `https://${process.env.R2_CUSTOM_DOMAIN}/${fileKey}`
      : `${process.env.R2_PUBLIC_URL}/${fileKey}`

    return NextResponse.json({ uploadUrl, publicUrl, key: fileKey })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
