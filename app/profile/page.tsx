"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Camera, User } from "lucide-react"

export default function ProfilePage() {
  const { data: session, update, status } = useSession()
  const router = useRouter()
  
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  })

  // Basic redirection if not authed
  if (status === "loading") return <div className="p-8 text-center flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Simulate API update for profile details
    await new Promise(resolve => setTimeout(resolve, 1000))
    await update({ name: formData.name }) // NextAuth update trick
    
    toast.success("Profile updated successfully")
    setIsSaving(false)
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Profile</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your personal information and public profile.
            </p>

            <div className="mt-8 bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 border-b border-border sm:border-b-0 sm:border-r pb-8 sm:pb-0 sm:pr-8">
                  <div className="relative h-24 w-24 rounded-full bg-secondary border flex items-center justify-center overflow-hidden">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                    <button className="absolute bottom-0 w-full bg-black/50 py-1 flex justify-center hover:bg-black/70 transition-colors">
                      <Camera className="h-4 w-4 text-white" />
                      <span className="sr-only">Upload profile photo</span>
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{session?.user?.role?.toLowerCase() || 'Member'}</p>
                  </div>
                </div>

                {/* Form Section */}
                <div className="flex-1">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input 
                        id="name" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                      />
                      <p className="text-xs text-muted-foreground">This is your public display name.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-secondary"
                      />
                      <p className="text-xs text-muted-foreground">Your email address cannot be changed at this time.</p>
                    </div>

                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground">Account Statistics</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">2026</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm font-medium text-muted-foreground">Books Owned</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">--</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
