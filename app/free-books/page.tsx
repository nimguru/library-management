"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookCard } from "@/components/books/book-card"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useCart } from "@/lib/store/cart"
import { toast } from "sonner"

export default function FreeBooksPage() {
  const addItem = useCart((state) => state.addItem)

  const { data: books = [], isLoading, isError } = useQuery<any[]>({
    queryKey: ['books', 'free'],
    queryFn: async () => {
      // In a real API we would fetch with ?isFree=true
      // The current backend might not support `isFree` filtering via query param directly yet
      // but we can fetch all and filter in client if needed, or update API later.
      const res = await fetch(`/api/books`)
      if (!res.ok) throw new Error("Failed to fetch")
      const allBooks = await res.json()
      return allBooks.filter((book: any) => Number(book.price) === 0)
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
        <div className="border-b border-border bg-primary/5 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-5xl">Free Books</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Enjoy a selection of complimentary books to jumpstart your learning and entertainment. Download full versions at zero cost.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading free books...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-medium text-destructive">Failed to load books</p>
            </div>
          ) : books.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-xl font-medium text-foreground">No free books available right now</p>
              <p className="mt-2 text-muted-foreground">
                Check back later for promotional offers and complimentary titles.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
