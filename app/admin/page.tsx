import Link from "next/link"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Receipt, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"


export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error("Failed to fetch stats")
      return res.json()
    }
  })

  const statsList = [
    {
      title: "Total Books",
      value: data?.stats?.books || 0,
      icon: BookOpen,
    },
    {
      title: "Total Users",
      value: data?.stats?.users || 0,
      icon: Users,
    },
    {
      title: "Total Orders",
      value: data?.stats?.sales || 0,
      icon: Receipt,
    },
    {
      title: "Revenue (KES)",
      value: data?.stats?.revenue?.toLocaleString() || "0",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Overview of your digital library
            </p>

            {/* Stats Grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statsList.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Recent Activity */}
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Link
                    href="/admin/orders"
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (data?.recentOrders || []).map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-foreground">ORD-{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {order.amount === 0 ? "Free" : `KES ${order.amount.toLocaleString()}`}
                          </p>
                          <Badge variant={order.status === "PAID" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Books */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Top Selling Books</CardTitle>
                  <Link
                    href="/admin/books"
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <p className="text-muted-foreground text-sm">Feature coming soon: Sales analytics by book.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
