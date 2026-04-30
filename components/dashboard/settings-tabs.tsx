"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { changePassword, deleteAccount, updateProfile } from "@/app/(dashboard)/dashboard/settings/actions"
import { AvatarUpload } from "@/components/dashboard/avatar-upload"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

type SettingsTabsProps = {
  userId: string
  email: string
  fullName: string
  avatarUrl: string | null
  hasGoogle: boolean
}

export function SettingsTabs({
  userId,
  email,
  fullName: initialFullName,
  avatarUrl: initialAvatarUrl,
  hasGoogle,
}: SettingsTabsProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(initialFullName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isDeleting, startDeleting] = useTransition()
  const [isSavingProfile, startSavingProfile] = useTransition()
  const [isChangingPassword, startChangingPassword] = useTransition()

  const connectGoogleLabel = useMemo(() => (hasGoogle ? "Connected" : "Connect Google"), [hasGoogle])

  const handleProfileSave = (formData: FormData) => {
    startSavingProfile(async () => {
      const result = await updateProfile(formData)
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.refresh()
    })
  }

  const handlePasswordSave = (formData: FormData) => {
    startChangingPassword(async () => {
      const result = await changePassword(formData)
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setPassword("")
      setConfirmPassword("")
    })
  }

  const handleConnectGoogle = async () => {
    if (hasGoogle) return
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/auth/callback?next=%2Fdashboard%2Fsettings` },
    })
    if (error) {
      toast.error("Unable to connect Google account.")
    }
  }

  const handleDeleteAccount = () => {
    startDeleting(async () => {
      const result = await deleteAccount()
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.push("/signup")
      router.refresh()
    })
  }

  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <AvatarUpload
          userId={userId}
          fullName={fullName}
          email={email}
          initialAvatarUrl={avatarUrl}
          onUploaded={(url) => {
            setAvatarUrl(url)
            router.refresh()
          }}
        />

        <form action={handleProfileSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} readOnly disabled />
          </div>
          <Button type="submit" disabled={isSavingProfile}>
            {isSavingProfile ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="account" className="space-y-6">
        <form action={handlePasswordSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>
          <Button type="submit" disabled={isChangingPassword}>
            {isChangingPassword ? "Updating..." : "Change password"}
          </Button>
        </form>

        <div className="space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Google account</p>
              <p className="text-sm text-muted-foreground">
                {hasGoogle ? "Your Google account is connected." : "Connect a Google account for easier sign in."}
              </p>
            </div>
            {hasGoogle ? (
              <Badge>Connected</Badge>
            ) : (
              <Button type="button" variant="outline" onClick={handleConnectGoogle}>
                {connectGoogleLabel}
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-destructive/40 p-4">
          <p className="font-medium text-destructive">Delete account</p>
          <p className="mb-3 text-sm text-muted-foreground">
            This removes your account permanently. All related data will be deleted.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" type="button">
                Delete account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete account?</DialogTitle>
                <DialogDescription>
                  This action is permanent and cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Confirm delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TabsContent>

      <TabsContent value="api-keys">
        <Alert>
          <p className="text-sm">Coming soon</p>
        </Alert>
      </TabsContent>

      <TabsContent value="notifications">
        <Alert>
          <p className="text-sm">Coming soon</p>
        </Alert>
      </TabsContent>
    </Tabs>
  )
}
