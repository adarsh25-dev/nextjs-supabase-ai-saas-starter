import Image from "next/image"
import Link from "next/link"
import { CreditCard, Lock, ShieldCheck, Sparkles, Type, Zap } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"

import { MotionFade } from "@/app/(marketing)/_components/motion-fade"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const GITHUB_URL = "https://github.com/adarshparmar/nextjs-supabase-ai-saas-starter"
const TWITTER_URL = "https://x.com"

type PlanCardData = {
  key: string
  name: string
  price: number
  features: string[]
}

type BelowFoldSectionsProps = {
  plans: PlanCardData[]
  codeSnippet: string
}

const featureItems = [
  {
    icon: ShieldCheck,
    title: "Production-ready auth",
    description: "Supabase auth with email/password, OAuth, magic link, and reset flow.",
  },
  {
    icon: CreditCard,
    title: "Stripe subscription billing",
    description: "3-tier plans with checkout, customer portal, and webhook sync.",
  },
  {
    icon: Sparkles,
    title: "AI chat with streaming",
    description: "Gemini-powered streaming conversations with session history.",
  },
  {
    icon: Lock,
    title: "Row-level security baked in",
    description: "Secure-by-default SQL schema and policies for multi-tenant safety.",
  },
  {
    icon: Type,
    title: "Type-safe end to end",
    description: "TypeScript + Zod + generated DB types for confidence at scale.",
  },
  {
    icon: Zap,
    title: "Deploy to Vercel in 1 click",
    description: "Optimized for modern DX with straightforward production deployment.",
  },
]

const faqs = [
  {
    q: "What's included?",
    a: "Auth, billing, chat, dashboard patterns, RLS schema, and production-oriented architecture.",
  },
  {
    q: "Can I use this commercially?",
    a: "Yes. This starter is open source with MIT licensing so you can build commercial products.",
  },
  {
    q: "Does it work with Razorpay too?",
    a: "Out of the box it uses Stripe. You can adapt the billing abstraction to other providers.",
  },
  {
    q: "Do I need to know Supabase?",
    a: "Basic familiarity helps, but the starter gives you a working baseline to learn by doing.",
  },
  {
    q: "How is this different from other starters?",
    a: "It focuses on AI SaaS workflows, reliable auth/billing foundations, and strongly typed code paths.",
  },
  {
    q: "Is it suitable for teams?",
    a: "Yes. It is structured for maintainability, with clear module boundaries and reusable components.",
  },
]

export function BelowFoldSections({ plans, codeSnippet }: BelowFoldSectionsProps) {
  return (
    <>
      <section className="border-y border-slate-200 bg-white py-8">
        <MotionFade className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-3 px-4 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Trusted by builders at:</span>
          {["Vercel", "Supabase", "Gemini", "Stripe"].map((logo) => (
            <span key={logo} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 font-semibold">
              {logo}
            </span>
          ))}
        </MotionFade>
      </section>

      <section id="features" className="py-24">
        <div className="mx-auto w-full max-w-7xl px-4">
          <MotionFade>
            <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to ship confidently
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
              Built for founders and developers who care about velocity and code quality.
            </p>
          </MotionFade>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureItems.map((feature, index) => (
              <MotionFade key={feature.title} delay={index * 0.04}>
                <Card className="h-full border-slate-200">
                  <CardHeader>
                    <feature.icon className="mb-3 size-6 text-purple-600" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </MotionFade>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 lg:grid-cols-2 lg:items-center">
          <MotionFade>
            <Badge variant="secondary" className="mb-4">
              AI integration in 10 lines
            </Badge>
            <h3 className="text-3xl font-bold tracking-tight">Ship streaming chat without boilerplate</h3>
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {`\
\`\`\`ts
${codeSnippet}
\`\`\`
`}
              </ReactMarkdown>
            </div>
          </MotionFade>

          <MotionFade delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <Image
                src="/marketing-chat-placeholder.svg"
                alt="Streaming chat interface preview"
                width={960}
                height={720}
                sizes="(max-width: 1024px) 100vw, 480px"
                className="h-auto w-full"
              />
            </div>
          </MotionFade>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto w-full max-w-7xl px-4">
          <MotionFade>
            <h3 className="text-center text-3xl font-bold tracking-tight md:text-4xl">Simple pricing</h3>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
              Start free, upgrade when your usage grows.
            </p>
          </MotionFade>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
              <MotionFade key={plan.key} delay={index * 0.05}>
                <Card className={plan.key === "pro" ? "border-purple-300 shadow-lg" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      {plan.key === "pro" ? <Badge>Popular</Badge> : null}
                    </div>
                    <p className="text-3xl font-bold">${plan.price}/mo</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {plan.features.map((feature) => (
                        <li key={feature}>- {feature}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </MotionFade>
            ))}
          </div>

          <MotionFade className="mt-8 text-center">
            <Link href="/pricing" className="font-semibold text-purple-700 hover:text-purple-800">
              View full pricing
            </Link>
          </MotionFade>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto w-full max-w-4xl px-4">
          <MotionFade>
            <h3 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
              Frequently asked questions
            </h3>
          </MotionFade>
          <MotionFade delay={0.05} className="mt-10">
            <Accordion type="single" collapsible className="w-full rounded-xl border border-slate-200 bg-white px-6">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.q} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-slate-600">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </MotionFade>
        </div>
      </section>

      <section className="py-24">
        <MotionFade className="mx-auto w-full max-w-3xl px-4 text-center">
          <h3 className="text-4xl font-bold tracking-tight">Start shipping your AI SaaS</h3>
          <p className="mt-4 leading-relaxed text-slate-600">
            Save months of setup and launch with battle-tested foundations.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="/signup">Get started free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                <GitHubMark className="size-4" />
                Star on GitHub
              </Link>
            </Button>
          </div>
        </MotionFade>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 md:grid-cols-4">
          <div>
            <h4 className="font-semibold">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/#features">Features</Link></li>
              <li><Link href={GITHUB_URL} target="_blank" rel="noreferrer">Roadmap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href={GITHUB_URL} target="_blank" rel="noreferrer">Docs</Link></li>
              <li><Link href={GITHUB_URL} target="_blank" rel="noreferrer">Blog</Link></li>
              <li><Link href={GITHUB_URL} target="_blank" rel="noreferrer">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href={GITHUB_URL} target="_blank" rel="noreferrer">About</Link></li>
              <li><Link href={GITHUB_URL} target="_blank" rel="noreferrer">Contact</Link></li>
              <li><Link href={GITHUB_URL} target="_blank" rel="noreferrer">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href={GITHUB_URL} target="_blank" rel="noreferrer">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-slate-600 md:flex-row">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <p>© {new Date().getFullYear()} SaaS Starter. All rights reserved.</p>
              <Link
                href="https://status.adarshparmar.dev"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900"
              >
                <span className="size-2 rounded-full bg-emerald-500" />
                All systems operational
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-slate-900">GitHub</Link>
              <Link href={TWITTER_URL} target="_blank" rel="noreferrer" className="hover:text-slate-900">Twitter</Link>
            </div>
          </div>
        </div>
      </footer>
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
