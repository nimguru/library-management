"use client"

import { useState } from "react"
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
import { Search, MoreHorizontal, Eye, RefreshCw, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

interface Order {
  id: string
  orderNumber: string
  customer: string
  email: string
  date: string
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED"
  total: number
  items: number
  paymentMethod: string
}


const statusColors = {
  PAID: "bg-primary/10 text-primary",
  PENDING: "bg-yellow-500/10 text-yellow-500",
  FAILED: "bg-destructive/10 text-destructive",
  REFUNDED: "bg-muted text-muted-foreground",
}

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const { data: orders = [], isLoading, isError } = useQuery<any[]>({
    queryKey: ['admin-orders', searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (statusFilter !== "ALL") params.set('status', statusFilter)
      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch orders")
      return res.json()
    }
  })

  const filteredOrders = orders

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Orders</h1>
                <p className="mt-1 text-muted-foreground">
                  Manage customer orders and payments
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={statusFilter === "ALL" ? "outline" : "ghost"} 
                  size="sm"
                  onClick={() => setStatusFilter("ALL")}
                >
                  All
                </Button>
                <Button 
                  variant={statusFilter === "PAID" ? "outline" : "ghost"} 
                  size="sm"
                  onClick={() => setStatusFilter("PAID")}
                >
                  Paid
                </Button>
                <Button 
                  variant={statusFilter === "PENDING" ? "outline" : "ghost"} 
                  size="sm"
                  onClick={() => setStatusFilter("PENDING")}
                >
                  Pending
                </Button>
                <Button 
                  variant={statusFilter === "FAILED" ? "outline" : "ghost"} 
                  size="sm"
                  onClick={() => setStatusFilter("FAILED")}
                >
                  Failed
                </Button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="mt-6 overflow-hidden rounded-lg border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Order
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Items
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                          <p className="mt-2 text-muted-foreground">Loading orders...</p>
                        </td>
                      </tr>
                    ) : isError ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <p className="text-destructive font-medium">Failed to load orders</p>
                        </td>
                      </tr>
                    ) : filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-secondary/50">
                          <td className="px-4 py-4">
                            <span className="font-medium text-foreground">
                              {order.orderNumber}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-foreground">{order.customer}</p>
                              <p className="text-sm text-muted-foreground">{order.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-muted-foreground">{order.date}</span>
                          </td>
                          <td className="px-4 py-4">
                            <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-muted-foreground">{order.items}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-medium text-foreground">
                              {order.total === 0 ? "Free" : `KES ${order.total.toLocaleString()}`}
                            </span>
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
                                <DropdownMenuItem className="gap-2">
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {order.status === "PAID" && (
                                  <DropdownMenuItem className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Process Refund
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <p className="text-muted-foreground">No orders found</p>
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
                Showing {filteredOrders.length} of {orders.length} orders
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
