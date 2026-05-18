import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import "cal-sans"

import { GlobalCommandPalette } from "@/components/layout/global-command-palette"
import { PosthogProvider } from "@/components/providers/posthog-provider"
import { Toaster } from "@/components/ui/sonner"
import { BRAND_NAME, BRAND_TAGLINE, ogImageUrl } from "@/lib/brand"
import { getSiteUrl } from "@/lib/site-url"
import "./globals.css"

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: {
    default: BRAND_NAME,
    template: `%s — ${BRAND_NAME}`,
  },
  description: BRAND_TAGLINE,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: BRAND_NAME,
    description: BRAND_TAGLINE,
    type: "website",
    url: siteUrl,
    images: [{ url: ogImageUrl() }],
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=1" },
      { url: "/favicon.ico?v=1", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.ico?v=1", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon.ico?v=1", sizes: "96x96", type: "image/x-icon" },
      { url: "/favicon.ico?v=1", sizes: "128x128", type: "image/x-icon" },
      { url: "/favicon.ico?v=1", sizes: "180x180", type: "image/x-icon" },
      { url: "/favicon.ico?v=1", sizes: "192x192", type: "image/x-icon" },
      { url: "/favicon.ico?v=1", sizes: "256x256", type: "image/x-icon" },
      { url: "/favicon.ico?v=1", sizes: "512x512", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico?v=1",
    apple: "/favicon.ico?v=1",
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
