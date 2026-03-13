"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, ArrowRight, Library, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useEffect } from "react"
import { useCart } from "@/lib/store/cart"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const clearCart = useCart((state) => state.clearCart)

  useEffect(() => {
    // Clear cart on successful checkout landing
    clearCart()
  }, [clearCart])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been processed and your books are now available in your library.
            </p>
          </div>

          {orderId && (
            <div className="bg-secondary/50 rounded-lg p-3 inline-block">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Order ID</span>
              <p className="font-mono text-sm font-semibold">{orderId}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/my-library">
              <Button className="w-full gap-2" size="lg">
                <Library className="h-4 w-4" />
                Go to My Library
              </Button>
            </Link>
            <Link href="/books">
              <Button variant="outline" className="w-full gap-2" size="lg">
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
