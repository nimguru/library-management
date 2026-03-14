import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const faqs = [
  {
    question: "How do I download a book after purchasing?",
    answer: "After a successful payment, go to your 'My Library' page from the dashboard menu. You will see a list of all your purchased books. Click the download button next to a book to receive a secure link to download the PDF or EPUB file."
  },
  {
    question: "What formats are the books available in?",
    answer: "Most of our books are available in PDF format. Some titles may also be available in EPUB format. The specific formats for each book are listed on its product details page."
  },
  {
    question: "Can I read the books offline?",
    answer: "Yes! Once you download the book file to your device (computer, tablet, or smartphone), you can read it offline using any compatible PDF or EPUB reader."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We use IntaSend to process payments securely. We currently accept M-Pesa, Visa, Mastercard, and direct bank transfers."
  },
  {
    question: "I lost my downloaded file. Can I download it again?",
    answer: "Yes, you have lifetime access to the books you purchase. Simply log in, go to 'My Library', and download the file again."
  },
  {
    question: "How do I reset my password?",
    answer: "Click the 'Forgot password?' link on the login page. Enter your email address, and we will send you instructions to reset your password securely."
  }
]

export default function FaqsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Frequently Asked Questions</h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Find answers to the most common questions about using Kitabu.
            </p>
          </div>
          
          <div className="relative max-w-xl mx-auto mb-12">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  className="pl-10 py-6 text-lg rounded-full shadow-sm"
                />
             </div>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-16 text-center">
            <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              If you couldn't find the answer you were looking for, our support team is ready to help.
            </p>
            <a href="/contact" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Contact Support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
