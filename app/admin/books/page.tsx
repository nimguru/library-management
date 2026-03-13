"use client"

import { useState } from "react"
import Image from "next/image"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Loader2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface Book {
  id: string
  title: string
  author: string
  coverUrl: string
  price: number
  isFree: boolean
  genres: string[]
  status: "published" | "draft"
  sales: number
}


export default function AdminBooksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const queryClient = useQueryClient()

  const { data: books = [], isLoading, isError } = useQuery<any[]>({
    queryKey: ['admin-books', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      const res = await fetch(`/api/books?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch books")
      return res.json()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Failed to delete book")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] })
      toast.success("Book deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  const filteredBooks = books

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Books</h1>
                <p className="mt-1 text-muted-foreground">
                  Manage your book catalogue
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Book
              </Button>
            </div>

            {/* Search */}
            <div className="mt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Books Table */}
            <div className="mt-6 overflow-hidden rounded-lg border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Book
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Genres
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Sales
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                          <p className="mt-2 text-muted-foreground">Loading books...</p>
                        </td>
                      </tr>
                    ) : isError ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <p className="text-destructive font-medium">Failed to load books</p>
                        </td>
                      </tr>
                    ) : filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-secondary/50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-secondary">
                                <Image
                                  src={book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop"}
                                  alt={book.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{book.title}</p>
                                <p className="text-sm text-muted-foreground">{book.author}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {book.genres?.map((genre: string) => (
                                <Badge key={genre} variant="secondary" className="text-xs">
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-foreground">
                              {book.isFree ? "Free" : `KES ${Number(book.price).toLocaleString()}`}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              className={
                                book.status === "published" || !book.status
                                  ? "bg-primary/10 text-primary"
                                  : "bg-yellow-500/10 text-yellow-500"
                              }
                            >
                              {book.status || "published"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-muted-foreground">{book._count?.orders || 0}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link href={`/books/${book.id}`}>
                                  <DropdownMenuItem className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem className="gap-2">
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2 text-destructive"
                                  onClick={() => {
                                    if(confirm("Are you sure?")) deleteMutation.mutate(book.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <p className="text-muted-foreground">No books found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredBooks.length} of {books.length} books
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
