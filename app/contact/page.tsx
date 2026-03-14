"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { MessageSquare, Mail, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call for form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    toast.success("Message sent successfully! We'll get back to you soon.")
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Header Section */}
        <div className="bg-primary/5 py-12 md:py-20 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
              Have questions about your order, our platform, or publishing with us? Our team is here to help.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form and our team will get back to you within 24-48 hours. For urgent inquiries regarding payments, please include your order reference number.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex shrink-0 items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <p className="text-muted-foreground">support@kitabu.com</p>
                    <p className="text-sm text-muted-foreground mt-1">For general inquiries and support</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex shrink-0 items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Live Chat</h3>
                    <p className="text-muted-foreground">Available Mon-Fri, 9am - 5pm EAT</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex shrink-0 items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Office</h3>
                    <p className="text-muted-foreground">Nairobi, Kenya</p>
                    <p className="text-sm text-muted-foreground mt-1">Headquarters</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" required placeholder="Jane" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" required placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">How can we help?</Label>
                  <Select name="topic" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support">Customer Support / Downloads</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="publishing">Publishing on Kitabu</SelectItem>
                      <SelectItem value="feedback">General Feedback</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    required 
                    placeholder="Provide as much detail as possible..." 
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
