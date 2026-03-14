"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { BookMarked, Cpu, Globe, HeartPulse, Lightbulb, Palette, TrendingUp, Users } from "lucide-react"

// Ideally, this list would be generated dynamically from all unique genres in the DB.
// Using a static representative list for the category browsing page.
const categories = [
  { name: "Business", slug: "Business", icon: <TrendingUp className="h-8 w-8 text-primary" />, count: "+" },
  { name: "Technology", slug: "Technology", icon: <Cpu className="h-8 w-8 text-primary" />, count: "+" },
  { name: "Science", slug: "Science", icon: <Globe className="h-8 w-8 text-primary" />, count: "+" },
  { name: "Health & Wellness", slug: "Health & Wellness", icon: <HeartPulse className="h-8 w-8 text-primary" />, count: "+" },
  { name: "Self-Help", slug: "Self-Help", icon: <Lightbulb className="h-8 w-8 text-primary" />, count: "+" },
  { name: "Fiction", slug: "Fiction", icon: <BookMarked className="h-8 w-8 text-primary" />, count: "+" },
  { name: "Arts & Photography", slug: "Arts & Photography", icon: <Palette className="h-8 w-8 text-primary" />, count: "+" },
  { name: "Biographies", slug: "Biographies", icon: <Users className="h-8 w-8 text-primary" />, count: "+" },
]

export default function CategoriesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Browse Categories</h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Explore our extensive collection of books by genre and topic.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.slug} href={`/books?genre=${category.slug}`} className="group block">
                <div className="flex h-full flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                  <div className="mb-4 rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{category.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Discover books in {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/books" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              View All Books
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
