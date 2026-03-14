import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact customer support. This includes your name, email address, and payment information.</p>
            
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to operate, maintain, and improve our services, process transactions, and communicate with you.</p>
            
            <h2>3. Information Sharing</h2>
            <p>We do not share your personal information with third parties except as necessary to provide our services, comply with the law, or protect our rights.</p>
            
            <h2>4. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect the security of your personal information.</p>
            
            <h2>5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You can manage your account settings or contact us to exercise these rights.</p>
            
            <h2>6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@kitabu.com.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
