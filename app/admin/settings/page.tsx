"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, Settings, CreditCard, HardDrive, Shield } from "lucide-react"

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Simulate Admin Settings API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success("Platform settings updated successfully")
    setIsSaving(false)
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Platform Settings</h1>
            <p className="mt-1 text-muted-foreground">
              Configure global application settings and integrations.
            </p>

            <form onSubmit={handleSave} className="mt-8 space-y-6">
              
              {/* General Settings */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/30 flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">General Configuration</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input id="platform-name" defaultValue="Kitabu LMS" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input id="support-email" type="email" defaultValue="support@kitabu.com" />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Allow New Registrations</p>
                      <p className="text-sm text-muted-foreground">Enable or disable user signups globally.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              {/* Payment Settings */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/30 flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">Payment Gateway (IntaSend)</h2>
                </div>
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-500">Test Mode</p>
                      <p className="text-sm text-yellow-600/80 dark:text-yellow-500/80">If enabled, transactions will not process real money.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="intasend-pk">Publishable Key</Label>
                      <Input id="intasend-pk" type="password" defaultValue="pk_test_****************" />
                      <p className="text-xs text-muted-foreground">Found in your IntaSend dashboard</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage Settings */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/30 flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">Storage (Cloudinary)</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cloud-name">Cloud Name</Label>
                    <Input id="cloud-name" defaultValue="your-cloud-name" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input id="api-key" type="password" defaultValue="8472947294" disabled />
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground italic">Note: Storage configuration is currently managed via Environment Variables (.env) for security reasons.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save All Configurations
                </Button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
