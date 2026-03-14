"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, BellRing, Lock, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  if (status === "loading") return <div className="p-8 text-center flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success("Password successfully updated")
    setIsChangingPassword(false)
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your account settings, security, and preferences.
            </p>

            <div className="mt-8 space-y-6">
              
              {/* Security Section */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-border bg-muted/20 flex gap-4 items-center">
                  <Lock className="h-6 w-6 text-foreground" />
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Security</h2>
                    <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" required />
                    </div>
                    <Button type="submit" disabled={isChangingPassword} className="mt-2">
                      {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Change Password
                    </Button>
                  </form>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-border bg-muted/20 flex gap-4 items-center">
                  <BellRing className="h-6 w-6 text-foreground" />
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Notifications</h2>
                    <p className="text-sm text-muted-foreground">Manage your email preferences and alerts.</p>
                  </div>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Order Updates</p>
                      <p className="text-sm text-muted-foreground">Receive emails about your purchases and downloads.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Promotional Emails</p>
                      <p className="text-sm text-muted-foreground">Receive updates about new book releases and discounts.</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-card border border-destructive/20 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-destructive/10 bg-destructive/5 flex gap-4 items-center">
                  <Trash2 className="h-6 w-6 text-destructive" />
                  <div>
                    <h2 className="text-lg font-bold text-destructive">Danger Zone</h2>
                    <p className="text-sm text-destructive/80">Irreversible account actions.</p>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain. All your purchased books will be inaccessible.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
