"use client"

import { useState, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  BookOpen,
  Download,
  ArrowLeft,
  Check,
} from "lucide-react"
import { FeaturedBooks } from "@/components/books/featured-books"
import { useQuery } from "@tanstack/react-query"
import { useCart } from "@/lib/store/cart"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"


export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { data: book, isLoading, isError } = useQuery<any>({
    queryKey: ['book', id],
    queryFn: async () => {
      const res = await fetch(`/api/books/${id}`)
      if (!res.ok) throw new Error("Book not found")
      return res.json()
    }
  })

  const addItem = useCart((state) => state.addItem)

  const handleAddToCart = () => {
    if (!book) return
    addItem({
      id: book.id,
      title: book.title,
      author: book.author,
      price: Number(book.price),
      coverUrl: book.coverUrl
    })
    toast.success(`${book.title} added to cart`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  if (isError || !book) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold">Book Not Found</h1>
          <p className="mt-2 text-muted-foreground">The book you're looking for doesn't exist.</p>
          <Link href="/books" className="mt-4">
            <Button>Back to Store</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Books
            </Link>
          </div>
        </div>

        {/* Book Details */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Cover Image */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary lg:sticky lg:top-24 lg:self-start">
              <Image
                src={book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=1200&fit=crop"}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
              {book.isFree && (
                <Badge className="absolute left-4 top-4 bg-primary text-primary-foreground">
                  Free
                </Badge>
              )}
            </div>

            {/* Book Info */}
            <div className="flex flex-col gap-6">
              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {book.genres?.map((genre: string) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Title and Author */}
              <div>
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                  {book.title}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">by {book.author}</p>
              </div>

              {/* Rating (Static for now as Review model is separate) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= 4
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium text-foreground">4.5</span>
                <span className="text-muted-foreground">
                  (12 reviews)
                </span>
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {book.isFree ? "Free" : `KES ${Number(book.price).toLocaleString()}`}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <Button size="lg" className="gap-2" onClick={handleAddToCart}>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 gap-2"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <Heart
                        className={`h-5 w-5 ${isWishlisted ? "fill-primary text-primary" : ""}`}
                      />
                      {isWishlisted ? "Wishlisted" : "Wishlist"}
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1 gap-2">
                      <Share2 className="h-5 w-5" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Purchase benefits */}
                <div className="mt-2 flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    Instant download after purchase
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    Available in PDF & EPUB formats
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    Lifetime access
                  </div>
                </div>
              </div>

              {/* Book Details Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="font-medium text-foreground">{book.pageCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="font-medium text-foreground">{book.publishedYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-medium text-foreground">{book.language}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Format</p>
                  <p className="font-medium text-foreground">PDF, EPUB</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  About this book
                </h2>
                <div className="prose prose-invert max-w-none">
                  {book.description?.split("\n\n").map((paragraph: string, index: number) => (
                    <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Reviews (0)
                </h2>
                <div className="flex flex-col gap-4">
                  <p className="text-muted-foreground italic">No reviews yet. Be the first to review!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Books */}
        <FeaturedBooks
          title="You might also like"
          subtitle="Based on this book's categories"
        />
      </main>
      <Footer />
    </div>
  )
}
