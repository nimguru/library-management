"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Receipt, ChevronDown, ChevronUp, Download } from "lucide-react"

interface OrderItem {
  id: string
  title: string
  author: string
  coverUrl: string
  price: number
}

interface Order {
  id: string
  orderNumber: string
  date: string
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED"
  total: number
  paymentMethod: string
  items: OrderItem[]
}

// Mock orders data
const orders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    date: "February 20, 2024",
    status: "PAID",
    total: 3500,
    paymentMethod: "M-Pesa",
    items: [
      {
        id: "1",
        title: "The Art of Business Strategy",
        author: "James Kimani",
        coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
        price: 1500,
      },
      {
        id: "2",
        title: "Modern Web Development",
        author: "Sarah Ochieng",
        coverUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop",
        price: 2000,
      },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    date: "February 15, 2024",
    status: "PAID",
    total: 0,
    paymentMethod: "Free",
    items: [
      {
        id: "3",
        title: "Mindful Leadership",
        author: "David Mwangi",
        coverUrl: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=600&fit=crop",
        price: 0,
      },
    ],
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    date: "February 10, 2024",
    status: "PAID",
    total: 0,
    paymentMethod: "Free",
    items: [
      {
        id: "7",
        title: "Introduction to AI",
        author: "Kevin Otieno",
        coverUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=600&fit=crop",
        price: 0,
      },
    ],
  },
]

const statusColors = {
  PAID: "bg-primary/10 text-primary",
  PENDING: "bg-yellow-500/10 text-yellow-500",
  FAILED: "bg-destructive/10 text-destructive",
  REFUNDED: "bg-muted text-muted-foreground",
}

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function OrdersPage() {
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const { data: session, status } = useSession()
  const router = useRouter()

  const { data: orders = [], isLoading, isError } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    enabled: !!session,
    queryFn: async () => {
      const res = await fetch('/api/orders/me')
      if (!res.ok) throw new Error("Failed to fetch orders")
      return res.json()
    }
  })

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
            <p className="text-destructive font-medium">Failed to load orders history</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Orders</h1>
              <p className="mt-1 text-muted-foreground">
                View your purchase history and download receipts
              </p>
            </div>

            {orders.length > 0 ? (
              <div className="mt-8 flex flex-col gap-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrders.includes(order.id)
                  return (
                    <div
                      key={order.id}
                      className="overflow-hidden rounded-lg border border-border bg-card"
                    >
                      {/* Order Header */}
                      <button
                        onClick={() => toggleOrder(order.id)}
                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/50"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                          <span className="font-semibold text-foreground">
                            {order.orderNumber}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {order.date}
                          </span>
                          <Badge className={statusColors[order.status]}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-foreground">
                            {order.total === 0
                              ? "Free"
                              : `KES ${order.total.toLocaleString()}`}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Order Details */}
                      {isExpanded && (
                        <div className="border-t border-border p-4">
                          <div className="flex flex-col gap-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex gap-4">
                                <Link
                                  href={`/books/${item.id}`}
                                  className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-secondary"
                                >
                                  <Image
                                    src={item.coverUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                  />
                                </Link>
                                <div className="flex flex-1 flex-col">
                                  <Link
                                    href={`/books/${item.id}`}
                                    className="font-medium text-foreground hover:text-primary"
                                  >
                                    {item.title}
                                  </Link>
                                  <p className="text-sm text-muted-foreground">
                                    {item.author}
                                  </p>
                                  <p className="mt-auto text-sm font-medium text-foreground">
                                    {item.price === 0
                                      ? "Free"
                                      : `KES ${item.price.toLocaleString()}`}
                                  </p>
                                </div>
                                {order.status === "PAID" && (
                                  <Button size="sm" variant="outline" className="gap-1 self-center">
                                    <Download className="h-4 w-4" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Payment Method</span>
                              <span>{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Items</span>
                              <span>{order.items.length}</span>
                            </div>
                            <div className="flex justify-between font-medium text-foreground">
                              <span>Total</span>
                              <span>
                                {order.total === 0
                                  ? "Free"
                                  : `KES ${order.total.toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-16 flex flex-col items-center justify-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                  <Receipt className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="mt-6 text-xl font-semibold text-foreground">
                  No orders yet
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Your purchase history will appear here
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
