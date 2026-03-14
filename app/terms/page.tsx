import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Terms of Service</h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>Welcome to Kitabu. By accessing our platform, you agree to these terms of service. Please read them carefully.</p>
            
            <h2>2. Eligibility</h2>
            <p>You must be at least 18 years old or have permission from a parent or guardian to use this platform.</p>
            
            <h2>3. Purchases and Payments</h2>
            <p>All purchases made on Kitabu are processed securely. Digital goods are delivered immediately upon successful payment.</p>
            
            <h2>4. Intellectual Property</h2>
            <p>All content provided on this platform is the property of Kitabu or its respective authors and is protected by copyright laws.</p>
            
            <h2>5. Prohibited Use</h2>
            <p>You may not redistribute, resell, or share digital books purchased from this platform without explicit authorization.</p>
            
            <h2>6. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms of service.</p>
            
            <h2>7. Governing Law</h2>
            <p>These terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
