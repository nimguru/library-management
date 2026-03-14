import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool as any)
  const prisma = new PrismaClient({ adapter })

  const adminPassword = await bcrypt.hash("admin123", 10)
  
  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@kitabu.com" },
    update: {},
    create: {
      email: "admin@kitabu.com",
      name: "Admin User",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  })

  console.log({ admin })

  // Sample Books
  const books = [
    {
      isbn: "978-1-23-456789-0",
      title: "The Art of Business Strategy",
      author: "James Kimani",
      description: "A comprehensive guide to modern business strategy in the African context.",
      price: 1500,
      isFree: false,
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
      fileKey: "seeds/the-art-of-business-strategy.pdf",
      genres: ["Business", "Strategy"],
      language: "en",
    },
    {
      isbn: "978-0-98-765432-1",
      title: "Modern Web Development",
      author: "Sarah Ochieng",
      description: "Mastering Next.js, React, and TypeSript for full-stack excellence.",
      price: 2000,
      isFree: false,
      coverUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop",
      fileKey: "seeds/modern-web-development.pdf",
      genres: ["Technology", "Programming"],
      language: "en",
    },
    {
      isbn: "978-3-16-148410-0",
      title: "Mindful Leadership",
      author: "David Mwangi",
      description: "Leading with impact and empathy in a fast-paced world.",
      price: 0,
      isFree: true,
      coverUrl: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=600&fit=crop",
      fileKey: "seeds/mindful-leadership.pdf",
      genres: ["Self-Help", "Leadership"],
      language: "en",
    },
  ]

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: book,
    })
  }

  console.log("Seeding finished.")
  await prisma.$disconnect()
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
