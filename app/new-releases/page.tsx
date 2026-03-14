"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookCard } from "@/components/books/book-card"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useCart } from "@/lib/store/cart"
import { toast } from "sonner"

export default function NewReleasesPage() {
  const addItem = useCart((state) => state.addItem)

  const { data: books = [], isLoading, isError } = useQuery<any[]>({
    queryKey: ['books', 'new-releases'],
    queryFn: async () => {
      const res = await fetch(`/api/books`)
      if (!res.ok) throw new Error("Failed to fetch")
      let allBooks = await res.json()
      // Sort by creation date descending to simulate new releases
      allBooks = allBooks.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      // Return top 12 newest
      return allBooks.slice(0, 12)
    }
  })

  const handleAddToCart = (book: any) => {
    addItem({
      id: book.id,
      title: book.title,
      author: book.author,
      price: Number(book.price),
      coverUrl: book.coverUrl
    })
    toast.success(`${book.title} added to cart`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-card py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground">New Releases</h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Fresh off the press. Discover the latest additions to our platform across all genres.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading new releases...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-medium text-destructive">Failed to load books</p>
            </div>
          ) : books.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <div key={book.id} className="relative">
                  <div className="absolute top-2 left-2 z-10 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm">
                    NEW
                  </div>
                  <BookCard book={book} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-xl font-medium text-foreground">No new books</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
