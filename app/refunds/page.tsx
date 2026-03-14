import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RefundsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Refund Policy</h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Learn about our policies for returns and refunds on digital goods.
            </p>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2>Digital Goods Return Policy</h2>
            <p>Because of the nature of digital products, books downloaded from Kitabu cannot be returned. We want you to be completely satisfied with your purchase, however, refunds are generally not provided.</p>
            
            <h2>Exceptions</h2>
            <p>We may grant refunds under the following exceptional circumstances:</p>
            <ul>
              <li><strong>Duplicate Purchase:</strong> You accidentally purchased the same book twice.</li>
              <li><strong>Defective File:</strong> The file is corrupt, unreadable, or not the book as advertised, and we cannot resolve the issue.</li>
              <li><strong>Failed Delivery:</strong> You paid for the book but it never appeared in your library, and our support team cannot fix the problem.</li>
            </ul>
            
            <h2>Timeframe for Requests</h2>
            <p>All refund requests must be submitted within 7 days of the original purchase date.</p>
            
            <h2>How to Request a Refund</h2>
            <p>If you believe you qualify for a refund under our exceptions policy, please contact our support team with your order number and a clear explanation of the issue.</p>
            
            <div className="mt-8">
              <Link href="/contact">
                <Button>Contact Support for a Refund</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
