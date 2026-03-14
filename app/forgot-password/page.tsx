"use client"

import { useState } from "react"
import Link from "next/link"
import { Book, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call for forgot password
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    setIsSubmitted(true)
    toast.success("Password reset instructions sent!")
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Book className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Kitabu</span>
          </Link>

          <h2 className="mt-8 text-2xl font-bold text-foreground">
            Reset your password
          </h2>
          <p className="mt-2 text-muted-foreground">
            Enter your email to receive a password reset link.
          </p>

          {isSubmitted ? (
             <div className="mt-8 flex flex-col gap-6">
                <div className="rounded-lg bg-primary/10 p-4 text-primary">
                  <p className="font-medium">Check your email</p>
                  <p className="mt-1 text-sm opacity-90">
                    We've sent a password reset link to your email address.
                  </p>
                </div>
                <Link href="/login" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Back to login
                </Link>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md px-8 text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Book className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Secure Account Access
            </h3>
            <p className="mt-4 text-muted-foreground">
              Get back into your account securely to access your entire library of digital books and downloads.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
