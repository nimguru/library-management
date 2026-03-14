import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookOpen, CreditCard, Download, ShieldAlert, LifeBuoy } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const categories = [
    {
      title: "Account & Profile",
      icon: <LifeBuoy className="h-6 w-6 text-primary" />,
      description: "Managing your account details, password resets, and profile settings.",
      link: "/faqs"
    },
    {
      title: "Payments & Billing",
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      description: "Information about accepted payment methods, invoices, and M-Pesa integration.",
      link: "/faqs"
    },
    {
      title: "My Library & Downloads",
      icon: <Download className="h-6 w-6 text-primary" />,
      description: "How to access, read, and download your purchased digital books.",
      link: "/faqs"
    },
    {
      title: "Platform Policies",
      icon: <ShieldAlert className="h-6 w-6 text-primary" />,
      description: "Understanding our terms of service, privacy policy, and refund procedures.",
      link: "/terms"
    }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/5 py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Hi, how can we help?
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Explore our knowledge base or get in touch with our support team.
            </p>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Topics</h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              {categories.map((category, index) => (
                <Link key={index} href={category.link} className="block group">
                  <div className="h-full rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                    <div className="flex items-start gap-4">
                      <div className="flex shrink-0 items-center justify-center rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-card border-t border-border">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Our dedicated support team is available to help you with any issues not covered in our help center.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                Contact Support
              </Link>
              <Link href="/faqs" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                Browse FAQs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
