import type { Metadata } from "next"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"

import { Navbar } from "@/app/(marketing)/_components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PLANS } from "@/lib/stripe/config"

const GITHUB_URL = "https://github.com/adarshparmar/nextjs-supabase-ai-saas-starter"
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: "Home — SaaS Starter",
  description: "Ship your AI SaaS in days with a production-ready Next.js starter.",
  openGraph: {
    title: "The Next.js + Supabase SaaS starter for AI products",
    description: "Ship your AI SaaS in days with auth, billing, AI chat, and dashboard.",
    type: "website",
    url: siteUrl,
    images: [{ url: `/api/og?title=${encodeURIComponent("Next.js + Supabase SaaS starter")}` }],
  },
}

const BelowFoldSections = dynamic(
  () =>
    import("@/app/(marketing)/_components/below-fold-sections").then(
      (mod) => mod.BelowFoldSections
    ),
  {
    loading: () => (
      <div className="mx-auto max-w-7xl px-4 py-24">
        <div className="h-52 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    ),
  }
)

const chatSnippet = `import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const result = streamText({
  model: openai("gpt-4o-mini"),
  messages,
});

return result.toUIMessageStreamResponse();`

export default function MarketingHomePage() {
  const plans = (Object.entries(PLANS) as Array<[keyof typeof PLANS, (typeof PLANS)[keyof typeof PLANS]]>).map(
    ([key, plan]) => ({
      key,
      name: plan.name,
      price: plan.price,
      features: plan.features,
    })
  )

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SaaS Starter",
              url: siteUrl,
              sameAs: [GITHUB_URL],
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SaaS Starter",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ]),
        }}
      />

      <main>
        <section className="py-24">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-5">
                Open source · MIT license
              </Badge>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
                The Next.js + Supabase SaaS starter for AI products
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                Ship your AI SaaS in days, not months. Auth, billing, AI chat, and dashboard - done right.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/signup">Get started free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                    <GitHubMark className="size-4" />
                    View on GitHub
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mx-auto mt-14 max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <Image
                src="/marketing-dashboard-placeholder.svg"
                alt="Dashboard screenshot placeholder"
                width={1600}
                height={900}
                priority
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <BelowFoldSections plans={plans} codeSnippet={chatSnippet} />
      </main>
    </>
  )
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.162 19.49c.5.093.682-.217.682-.482 0-.237-.009-.867-.014-1.702-2.776.603-3.363-1.339-3.363-1.339-.455-1.155-1.11-1.463-1.11-1.463-.908-.621.069-.608.069-.608 1.003.07 1.53 1.03 1.53 1.03.892 1.529 2.341 1.087 2.91.832.091-.647.349-1.087.634-1.337-2.217-.252-4.55-1.108-4.55-4.935 0-1.09.39-1.981 1.03-2.679-.103-.253-.447-1.268.098-2.645 0 0 .84-.269 2.75 1.023A9.56 9.56 0 0 1 12 6.844c.85.004 1.706.115 2.506.337 1.909-1.292 2.748-1.023 2.748-1.023.546 1.377.202 2.392.1 2.645.64.698 1.028 1.588 1.028 2.679 0 3.837-2.337 4.68-4.563 4.927.359.31.679.922.679 1.858 0 1.341-.012 2.423-.012 2.753 0 .268.18.58.688.481A10.001 10.001 0 0 0 12 2Z"
      />
    </svg>
  )
}
