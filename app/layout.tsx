import type { Metadata } from "next"

import { PosthogProvider } from "@/components/providers/posthog-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: "Next.js Supabase AI SaaS Starter",
  description: "Production-ready Next.js + Supabase starter for AI SaaS products.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Next.js Supabase AI SaaS Starter",
    description: "Production-ready Next.js + Supabase starter for AI SaaS products.",
    type: "website",
    url: siteUrl,
    images: [{ url: `/api/og?title=${encodeURIComponent("Next.js Supabase AI SaaS Starter")}` }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <PosthogProvider>
          {children}
          <Toaster />
        </PosthogProvider>
      </body>
    </html>
  )
}
