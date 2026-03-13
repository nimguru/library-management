"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/books/search-bar"
import { CategoryFilter } from "@/components/books/category-filter"
import { BookCard, type Book } from "@/components/books/book-card"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, Grid3X3, List, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useCart } from "@/lib/store/cart"
import { toast } from "sonner"


export default function BooksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [showFilters, setShowFilters] = useState(false)
  const addItem = useCart((state) => state.addItem)

  const { data: books = [], isLoading, isError } = useQuery<any[]>({
    queryKey: ['books', searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedCategory !== "All Categories") params.set('genre', selectedCategory)
      
      const res = await fetch(`/api/books?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    }
  })

  // We don't need local filtering since we handle it in API
  const filteredBooks = books

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
        <div className="border-b border-border bg-card py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground">Browse Books</h1>
            <p className="mt-2 text-muted-foreground">
              Discover your next great read from our collection
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search books, authors..."
              />
              <Button
                variant="outline"
                className="gap-2 sm:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden w-56 shrink-0 lg:block">
              <CategoryFilter
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </aside>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="fixed inset-0 z-50 bg-background p-4 lg:hidden">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button variant="ghost" onClick={() => setShowFilters(false)}>
                    Close
                  </Button>
                </div>
                <div className="mt-6">
                  <CategoryFilter
                    selected={selectedCategory}
                    onSelect={(cat) => {
                      setSelectedCategory(cat)
                      setShowFilters(false)
                    }}
                  />
                </div>
              </div>
            )}

            {/* Books Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredBooks.length} books
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-primary">
                    <Grid3X3 className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <List className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Loading books...</p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="text-lg font-medium text-destructive">Failed to load books</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : filteredBooks.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg font-medium text-foreground">No books found</p>
                  <p className="mt-2 text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
