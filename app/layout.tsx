import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import "cal-sans"

import { GlobalCommandPalette } from "@/components/layout/global-command-palette"
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[hsl(0_0%_0%)]">
        <PosthogProvider>
          {children}
          <GlobalCommandPalette />
          <Toaster />
        </PosthogProvider>
      </body>
    </html>
  )
}
