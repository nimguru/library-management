"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function AdminBooksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<any>(null)
  
  const queryClient = useQueryClient()

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    price: 0,
    isFree: false,
    genres: "",
    language: "English",
    pages: 0,
    coverUrl: "",
  })

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

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create book")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] })
      toast.success("Book created successfully")
      closeDialog()
    },
    onError: (error: any) => toast.error(error.message)
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await fetch(`/api/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update book")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] })
      toast.success("Book updated successfully")
      closeDialog()
    },
    onError: (error: any) => toast.error(error.message)
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
    onError: (error: any) => toast.error(error.message)
  })

  const openAddDialog = () => {
    setEditingBook(null)
    setFormData({
      title: "",
      author: "",
      description: "",
      price: 0,
      isFree: false,
      genres: "",
      language: "English",
      pages: 0,
      coverUrl: "",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (book: any) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: Number(book.price),
      isFree: book.isFree,
      genres: book.genres.join(", "),
      language: book.language,
      pages: book.pageCount || 0,
      coverUrl: book.coverUrl || "",
    })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingBook(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...formData,
      genres: formData.genres.split(",").map(g => g.trim()).filter(g => g !== ""),
      price: Number(formData.price),
      pages: Number(formData.pages),
    }

    if (editingBook) {
      updateMutation.mutate({ id: editingBook.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

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
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Book
              </Button>
            </div>

            {/* Book Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>{editingBook ? "Edit Book" : "Add New Book"}</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to {editingBook ? "update" : "create"} a book.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        required 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <Input 
                        id="author" 
                        required 
                        value={formData.author}
                        onChange={e => setFormData({...formData, author: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      required 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (KES)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        required 
                        disabled={formData.isFree}
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch 
                        id="isFree" 
                        checked={formData.isFree}
                        onCheckedChange={checked => setFormData({...formData, isFree: checked, price: checked ? 0 : formData.price})}
                      />
                      <Label htmlFor="isFree">This is a free book</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="genres">Genres (comma-separated)</Label>
                      <Input 
                        id="genres" 
                        placeholder="Action, Drama, Sci-Fi"
                        value={formData.genres}
                        onChange={e => setFormData({...formData, genres: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input 
                        id="language" 
                        value={formData.language}
                        onChange={e => setFormData({...formData, language: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pages">Page Count</Label>
                      <Input 
                        id="pages" 
                        type="number" 
                        value={formData.pages}
                        onChange={e => setFormData({...formData, pages: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coverUrl">Cover Image URL</Label>
                      <Input 
                        id="coverUrl" 
                        placeholder="https://example.com/image.jpg"
                        value={formData.coverUrl}
                        onChange={e => setFormData({...formData, coverUrl: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingBook ? "Save Changes" : "Create Book"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

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
                    ) : books.length > 0 ? (
                      books.map((book) => (
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
                                <DropdownMenuItem className="gap-2" onClick={() => openEditDialog(book)}>
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

            {/* Pagination placeholder */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {books.length} books
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
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
