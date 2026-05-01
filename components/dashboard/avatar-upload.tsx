"use client"

import { useRef, useState } from "react"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type AvatarUploadProps = {
  userId: string
  fullName: string
  email: string
  initialAvatarUrl: string | null
  onUploaded?: (url: string) => void
}

function initials(fullName: string, email: string) {
  const trimmed = fullName.trim()
  if (!trimmed) return email.slice(0, 2).toUpperCase()
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function AvatarUpload({
  userId,
  fullName,
  email,
  initialAvatarUrl,
  onUploaded,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max avatar size is 5MB.")
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    setIsUploading(true)
    try {
      const supabase = createClient()
      const extension = file.name.split(".").pop() || "png"
      const filePath = `${userId}/avatar-${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const publicUrl = data.publicUrl

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId)

      if (profileError) {
        throw profileError
      }

      onUploaded?.(publicUrl)
      setPreviewUrl(publicUrl)
      toast.success("Avatar updated.")
    } catch {
      toast.error("Failed to upload avatar.")
      setPreviewUrl(initialAvatarUrl)
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-4">
        <Avatar className="size-20 ring-1 ring-[hsl(var(--color-border))] transition-all hover:ring-[hsl(var(--color-accent-soft)/0.8)]">
          <AvatarImage src={previewUrl ?? undefined} alt={fullName} />
          <AvatarFallback>{initials(fullName, email)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-[hsl(var(--color-text-primary))]">Upload a profile picture</p>
          <p className="text-xs text-[hsl(var(--color-text-secondary))]">PNG/JPG up to 5MB</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          "group flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated)/0.6)] px-4 py-5 text-sm text-[hsl(var(--color-text-secondary))] transition-all duration-200 hover:border-[hsl(var(--color-accent-soft)/0.7)] hover:text-[hsl(var(--color-text-primary))]",
          isUploading ? "cursor-not-allowed opacity-70" : ""
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Camera className="size-4" />
            Choose image
          </>
        )}
      </button>
    </div>
  )
}
