import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
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
      title: "The Art of Business Strategy",
      author: "James Kimani",
      description: "A comprehensive guide to modern business strategy in the African context.",
      price: 1500,
      isFree: false,
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
      fileFormat: "PDF, EPUB",
      genres: ["Business", "Strategy"],
      language: "English",
    },
    {
      title: "Modern Web Development",
      author: "Sarah Ochieng",
      description: "Mastering Next.js, React, and TypeSript for full-stack excellence.",
      price: 2000,
      isFree: false,
      coverUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop",
      fileFormat: "PDF, EPUB",
      genres: ["Technology", "Programming"],
      language: "English",
    },
    {
      title: "Mindful Leadership",
      author: "David Mwangi",
      description: "Leading with impact and empathy in a fast-paced world.",
      price: 0,
      isFree: true,
      coverUrl: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=600&fit=crop",
      fileFormat: "PDF",
      genres: ["Self-Help", "Leadership"],
      language: "English",
    },
  ]

  for (const book of books) {
    // Check if book exists by title (since title isn't unique, we just take the first one or create)
    const existing = await prisma.book.findFirst({
      where: { title: book.title }
    })

    if (!existing) {
      await prisma.book.create({
        data: {
          ...book,
          fileKey: `seeds/${book.title.toLowerCase().replace(/ /g, '-')}.pdf` // Mock file key
        }
      })
    }
  }

  console.log("Seeding finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
