"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, BookOpen, Search, Grid3X3, List, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"


export default function MyLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { data: session, status } = useSession()
  const router = useRouter()

  const { data: books = [], isLoading, isError } = useQuery<any[]>({
    queryKey: ['purchased-books', searchQuery],
    enabled: !!session,
    queryFn: async () => {
      const res = await fetch(`/api/my-library`)
      if (!res.ok) throw new Error("Failed to fetch library")
      return res.json()
    }
  })

  const filteredBooks = books.filter(
    (book: any) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDownload = async (book: any) => {
    try {
      toast.info("Preparing your download...")
      const res = await fetch(`/api/downloads/${book.id}`)
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || "Failed to get download link")
      
      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        throw new Error("Download link not available")
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  My Library
                </h1>
                <p className="mt-1 text-muted-foreground">
                  {books.length} books in your collection
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search your books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:w-64"
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={viewMode === "grid" ? "text-primary" : "text-muted-foreground"}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={viewMode === "list" ? "text-primary" : "text-muted-foreground"}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading your library...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-lg font-medium text-destructive">Failed to load library</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : filteredBooks.length > 0 ? (
              viewMode === "grid" ? (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      className="group overflow-hidden rounded-lg border border-border bg-card"
                    >
                      <Link
                        href={`/books/${book.id}`}
                        className="relative block aspect-[3/4] overflow-hidden bg-secondary"
                      >
                        <Image
                          src={book.coverUrl}
                          alt={book.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </Link>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {book.genres.slice(0, 2).map((genre: string) => (
                            <Badge key={genre} variant="secondary" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                        <Link href={`/books/${book.id}`}>
                          <h3 className="mt-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => handleDownload(book)}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <BookOpen className="h-4 w-4" />
                            Read
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 flex flex-col gap-4">
                  {filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      className="flex gap-4 rounded-lg border border-border bg-card p-4"
                    >
                      <Link
                        href={`/books/${book.id}`}
                        className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md bg-secondary"
                      >
                        <Image
                          src={book.coverUrl}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex flex-wrap gap-1">
                          {book.genres.map((genre: string) => (
                            <Badge key={genre} variant="secondary" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                        <Link href={`/books/${book.id}`}>
                          <h3 className="mt-1 font-semibold text-foreground hover:text-primary">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <p className="text-sm text-muted-foreground">
                            Purchased recently
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="gap-1"
                              onClick={() => handleDownload(book)}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <BookOpen className="h-4 w-4" />
                              Read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="mt-16 flex flex-col items-center justify-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="mt-6 text-xl font-semibold text-foreground">No books found</h2>
                <p className="mt-2 text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Start building your library by purchasing books"}
                </p>
                <Link href="/books" className="mt-6">
                  <Button>Browse Books</Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
