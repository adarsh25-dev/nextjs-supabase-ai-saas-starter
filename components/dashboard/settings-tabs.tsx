"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Check, KeyRound, Pencil, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { Drawer } from "vaul"

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
import { AuthInput } from "@/components/auth/AuthInput"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

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
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "notifications" | "api-keys">("profile")
  const [fullName, setFullName] = useState(initialFullName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isAvatarDrawerOpen, setIsAvatarDrawerOpen] = useState(false)
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    push: false,
    inApp: true,
  })
  const [isDeleting, startDeleting] = useTransition()
  const [isSavingProfile, startSavingProfile] = useTransition()
  const [isChangingPassword, startChangingPassword] = useTransition()
  const [showSavedState, setShowSavedState] = useState(false)

  const connectGoogleLabel = useMemo(() => (hasGoogle ? "Connected" : "Connect Google"), [hasGoogle])
  const passwordStrength = useMemo(() => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score
  }, [password])
  const passwordStrengthLabel = ["Weak", "Fair", "Good", "Strong"][Math.max(0, passwordStrength - 1)] ?? "Weak"

  const handleProfileSave = (formData: FormData) => {
    startSavingProfile(async () => {
      const result = await updateProfile(formData)
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setShowSavedState(true)
      setTimeout(() => setShowSavedState(false), 1300)
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
      setCurrentPassword("")
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

  const tabItems: Array<{ key: "profile" | "account" | "notifications" | "api-keys"; label: string }> = [
    { key: "profile", label: "Profile" },
    { key: "account", label: "Account" },
    { key: "notifications", label: "Notifications" },
    { key: "api-keys", label: "API Keys" },
  ]

  const initials = (() => {
    const source = fullName.trim() || email
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
  })()

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-20 -mx-2 border-b border-[hsl(var(--color-border))] bg-black/40 px-2 py-2 backdrop-blur">
        <div className="relative flex gap-5">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative pb-2 text-sm transition-colors",
                activeTab === tab.key
                  ? "text-[hsl(var(--color-text-primary))]"
                  : "text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))]"
              )}
            >
              {tab.label}
              {activeTab === tab.key ? (
                <motion.span
                  layoutId="settings-tab-underline"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  className="absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-[image:var(--gradient-ember)]"
                />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {activeTab === "profile" ? (
              <>
                <div className="glass rounded-2xl border border-[hsl(var(--color-border))] p-6">
                  <button
                    type="button"
                    className="group relative inline-flex"
                    onClick={() => setIsAvatarDrawerOpen(true)}
                  >
                    <Avatar className="size-24 ring-1 ring-transparent transition-all group-hover:ring-[hsl(var(--color-accent-soft)/0.8)]">
                      <AvatarImage src={avatarUrl ?? undefined} alt={fullName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 inline-flex size-7 items-center justify-center rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] text-[hsl(var(--color-text-secondary))] opacity-0 transition-opacity group-hover:opacity-100">
                      <Pencil className="size-3.5" />
                    </span>
                  </button>
                </div>

                <form action={handleProfileSave} className="glass space-y-4 rounded-2xl border border-[hsl(var(--color-border))] p-6">
                  <AuthInput
                    id="fullName"
                    name="fullName"
                    label="Full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[hsl(var(--color-text-secondary))]">Email</p>
                      <Badge className="bg-[hsl(84_22%_63%/0.14)] text-[hsl(84_22%_63%)]">Verified</Badge>
                    </div>
                    <input
                      readOnly
                      value={email}
                      className="h-11 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] px-3 text-sm text-[hsl(var(--color-text-secondary))]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSavingProfile} className="min-w-32">
                      {showSavedState ? (
                        <span className="inline-flex items-center gap-1">
                          <Check className="size-4" /> Saved
                        </span>
                      ) : isSavingProfile ? (
                        "Saving..."
                      ) : (
                        "Save changes"
                      )}
                    </Button>
                  </div>
                </form>
              </>
            ) : null}

            {activeTab === "account" ? (
              <>
                <form action={handlePasswordSave} className="glass space-y-4 rounded-2xl border border-[hsl(var(--color-border))] p-6">
                  <h3 className="font-display text-lg">Change password</h3>
                  <AuthInput
                    id="currentPassword"
                    label="Current password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    showTogglePassword
                  />
                  <AuthInput
                    id="password"
                    name="password"
                    label="New password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    showTogglePassword
                    required
                  />
                  <div className="space-y-2">
                    <div className="h-1.5 rounded-full bg-[hsl(var(--color-text-primary)/0.08)]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          passwordStrength <= 1
                            ? "w-1/4 bg-[hsl(var(--color-danger))]"
                            : passwordStrength === 2
                              ? "w-2/4 bg-[hsl(var(--color-warning))]"
                              : passwordStrength === 3
                                ? "w-3/4 bg-[hsl(var(--color-accent-soft))]"
                                : "w-full bg-[hsl(var(--color-accent))]"
                        )}
                      />
                    </div>
                    <p className="text-xs text-[hsl(var(--color-text-secondary))]">Strength: {passwordStrengthLabel}</p>
                  </div>
                  <AuthInput
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm new password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    showTogglePassword
                    required
                  />
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Updating..." : "Change password"}
                  </Button>
                </form>

                <div className="glass rounded-2xl border border-[hsl(var(--color-border))] p-6">
                  <h3 className="font-display text-lg">Connected accounts</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--color-border))] p-3">
                      <div>
                        <p className="text-sm">Google</p>
                        <p className="text-xs text-[hsl(var(--color-text-secondary))]">
                          {hasGoogle ? "Connected to your profile." : "Connect for one-tap sign in."}
                        </p>
                      </div>
                      {hasGoogle ? (
                        <Button variant="outline" disabled>
                          Disconnect
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={handleConnectGoogle}>
                          {connectGoogleLabel}
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--color-border))] p-3">
                      <div>
                        <p className="text-sm">GitHub</p>
                        <p className="text-xs text-[hsl(var(--color-text-secondary))]">Coming soon.</p>
                      </div>
                      <Button variant="outline" disabled>
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[hsl(var(--color-danger)/0.35)] p-6">
                  <div className="mb-3 flex items-center gap-2 text-[hsl(var(--color-danger))]">
                    <ShieldAlert className="size-4" />
                    <h3 className="font-display text-lg">Danger zone</h3>
                  </div>
                  <p className="mb-4 text-sm text-[hsl(var(--color-text-secondary))]">
                    This removes your account permanently. All related data will be deleted.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" type="button">
                        Delete account
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))]">
                      <DialogHeader>
                        <DialogTitle>Delete account?</DialogTitle>
                        <DialogDescription>This action is permanent and cannot be undone.</DialogDescription>
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
              </>
            ) : null}

            {activeTab === "notifications" ? (
              <div className="space-y-3">
                {[
                  {
                    key: "email",
                    title: "Email notifications",
                    desc: "Product updates, receipts, and security alerts.",
                  },
                  { key: "push", title: "Push notifications", desc: "Realtime updates in supported browsers." },
                  { key: "inApp", title: "In-app notifications", desc: "Show notifications while using dashboard." },
                ].map((item) => (
                  <div key={item.key} className="glass flex items-center justify-between rounded-2xl border border-[hsl(var(--color-border))] p-4">
                    <div>
                      <p className="text-sm text-[hsl(var(--color-text-primary))]">{item.title}</p>
                      <p className="text-xs text-[hsl(var(--color-text-secondary))]">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notificationPrefs[item.key as keyof typeof notificationPrefs]}
                      onCheckedChange={(value) =>
                        setNotificationPrefs((prev) => ({ ...prev, [item.key]: value }))
                      }
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {activeTab === "api-keys" ? (
              <div className="glass rounded-2xl border border-[hsl(var(--color-border))] p-8 text-center">
                <div className="mx-auto mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-[hsl(var(--color-accent)/0.2)] text-[hsl(var(--color-accent-soft))]">
                  <KeyRound className="size-6" />
                </div>
                <p className="font-display text-lg">API keys are coming soon</p>
                <p className="mt-2 text-sm text-[hsl(var(--color-text-secondary))]">
                  Join the waitlist to get early access to API features.
                </p>
                <div className="mx-auto mt-4 flex max-w-sm gap-2">
                  <input
                    placeholder="you@company.com"
                    className="h-10 flex-1 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] px-3 text-sm"
                  />
                  <Button>Join</Button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <Drawer.Root open={isAvatarDrawerOpen} onOpenChange={setIsAvatarDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70" />
          <Drawer.Content className="glass fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-[hsl(var(--color-border))] p-4">
            <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-[hsl(var(--color-text-primary)/0.2)]" />
            <AvatarUpload
              userId={userId}
              fullName={fullName}
              email={email}
              initialAvatarUrl={avatarUrl}
              onUploaded={(url) => {
                setAvatarUrl(url)
                router.refresh()
                setIsAvatarDrawerOpen(false)
              }}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}

function Switch({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors duration-200",
        checked
          ? "border-[hsl(var(--color-accent-soft))] bg-[hsl(var(--color-accent)/0.35)]"
          : "border-[hsl(var(--color-border))] bg-[hsl(var(--color-text-primary)/0.1)]"
      )}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full bg-white transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  )
}
