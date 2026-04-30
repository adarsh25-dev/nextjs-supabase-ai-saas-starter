import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  openGraph: {
    title: "SaaS Starter",
    description: "Production-ready starter for AI SaaS apps.",
    type: "website",
    url: siteUrl,
    images: [{ url: `/api/og?title=${encodeURIComponent("SaaS Starter")}` }],
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="bg-slate-50 text-slate-900">{children}</div>
}
