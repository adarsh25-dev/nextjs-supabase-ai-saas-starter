"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Type,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AnimatedNumber } from "@/components/ui/primitives/AnimatedNumber"
import { BorderBeam } from "@/components/ui/primitives/BorderBeam"
import { DotPattern } from "@/components/ui/primitives/DotPattern"
import { GlowCard } from "@/components/ui/primitives/GlowCard"
import { GridBackground } from "@/components/ui/primitives/GridBackground"
import { MagneticButton } from "@/components/ui/primitives/MagneticButton"
import { RevealOnScroll } from "@/components/ui/primitives/RevealOnScroll"
import { Spotlight } from "@/components/ui/primitives/Spotlight"
import { cn } from "@/lib/utils"
import { Footer } from "@/components/marketing/Footer"
import { Nav } from "@/components/marketing/Nav"
import { motion, useInView, useScroll, useTransform } from "framer-motion"

const HeroOrb = dynamic(
  () => import("@/components/marketing/HeroOrb").then((mod) => mod.HeroOrb),
  { ssr: false }
)

type PlanCardData = {
  key: string
  name: string
  price: number
  features: string[]
}

type LandingPageClientProps = {
  plans: PlanCardData[]
  codeLines: string[]
}

const GITHUB_URL = "https://github.com/adarshparmar/nextjs-supabase-ai-saas-starter"
const heroHeadingLineTwo = "SaaS starter for AI products"

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

const stackLogos = ["Vercel", "Supabase", "OpenAI", "Stripe", "Anthropic", "Tailwind", "Next.js", "TypeScript"]

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [query])
  return matches
}

function SectionSeparator() {
  return (
    <div className="mx-auto h-px w-full max-w-7xl bg-[linear-gradient(90deg,transparent,hsl(var(--color-accent)/0.45),hsl(var(--color-accent-soft)/0.4),transparent)]" />
  )
}

export function LandingPageClient({ plans, codeLines }: LandingPageClientProps) {
  const router = useRouter()
  const showOrb = useMediaQuery("(min-width: 1024px)")
  const previewRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: previewRef,
    offset: ["start 85%", "end 30%"],
  })
  const rotateX = useTransform(scrollYProgress, [0, 1], [12, 0])

  const faqColumns = useMemo(() => {
    const midpoint = Math.ceil(faqs.length / 2)
    return [faqs.slice(0, midpoint), faqs.slice(midpoint)]
  }, [])

  return (
    <>
      <Nav />
      <main className="relative z-10">
        <section className="relative min-h-[100svh] overflow-hidden">
          <GridBackground />
          <DotPattern />
          <Spotlight />
          <div className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-4 pb-24 pt-28">
            <div className="relative mx-auto max-w-4xl text-center">
              {showOrb ? (
                <div className="pointer-events-none absolute right-[-14rem] top-[-12rem] hidden lg:block">
                  <HeroOrb />
                </div>
              ) : null}
              <div className="animate-[hero-fade-up_480ms_cubic-bezier(0.16,1,0.3,1)_both]">
                <button
                  type="button"
                  className="group mx-auto inline-flex items-center gap-2 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated)/0.7)] px-4 py-2 text-xs text-[hsl(var(--color-text-secondary))] shadow-[0_0_45px_-18px_hsl(var(--color-accent)/0.4)]"
                >
                  <Sparkles className="size-3.5 text-[hsl(var(--color-accent-soft))]" />
                  Open source · MIT license
                  <ChevronRight className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" />
                </button>
              </div>

              <div
                className="animate-[hero-fade-up_560ms_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: "70ms" }}
              >
                <h1 className="mt-7 text-[clamp(2.4rem,7vw,5.4rem)] leading-[0.95] tracking-[-0.04em] text-[hsl(var(--color-text-primary))]">
                  The Next.js + Supabase
                </h1>
                <h1 className="mt-2 text-[clamp(2.2rem,6.2vw,5.2rem)] leading-[0.95] tracking-[-0.04em] text-[hsl(var(--color-text-primary))]">
                  {heroHeadingLineTwo.split("").map((char, index) => {
                    const isAccentStart = index >= heroHeadingLineTwo.indexOf("AI products")
                    return (
                      <span
                        key={`${char}-${index}`}
                        style={{ animationDelay: `${120 + index * 14}ms` }}
                        className={cn(
                          "inline-block whitespace-pre animate-[char-reveal_420ms_cubic-bezier(0.16,1,0.3,1)_both]",
                          isAccentStart
                            ? "bg-gradient-to-r from-[hsl(16_60%_60%)] to-[hsl(32_47%_61%)] bg-clip-text text-transparent"
                            : ""
                        )}
                      >
                        {char}
                      </span>
                    )
                  })}
                </h1>
              </div>

              <div
                className="animate-[hero-fade-up_620ms_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: "150ms" }}
              >
                <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-[hsl(var(--color-text-secondary))]">
                  Ship your AI SaaS in days, not months. Auth, billing, AI chat, and dashboard — done right.
                </p>
              </div>

              <div
                className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-[hero-fade-up_680ms_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: "220ms" }}
              >
                <MagneticButton variant="primary" onClick={() => router.push("/signup")}>
                  Get started free
                  <ArrowRight className="size-4" />
                </MagneticButton>
                <MagneticButton variant="secondary" onClick={() => window.open(GITHUB_URL, "_blank", "noopener,noreferrer")}>
                  <GitHubMark className="size-4" />
                  View on GitHub
                  <span className="ml-2 text-[hsl(var(--color-text-secondary))]">↗</span>
                </MagneticButton>
              </div>

              <div
                className="animate-[hero-fade-up_720ms_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: "280ms" }}
              >
                <p className="mt-8 text-sm text-[hsl(var(--color-text-secondary))]">
                  No credit card required · Deploy in 5 minutes
                </p>
              </div>
            </div>

            <RevealOnScroll delay={0.34} className="mt-20">
              <motion.div ref={previewRef} style={{ rotateX }} className="[perspective:1400px]">
                <GlowCard glow className="relative mx-auto max-w-6xl p-2">
                  <div className="relative overflow-hidden rounded-[1rem] border border-[hsl(var(--color-border))]">
                    <Image
                      src="/marketing-dashboard-placeholder.svg"
                      alt="SaaS dashboard preview"
                      width={1600}
                      height={920}
                      sizes="(max-width: 1280px) 100vw, 1200px"
                      className="h-auto w-full"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,hsl(var(--color-bg)))]" />

                    <FloatingLabel className="left-6 top-8" text="Real-time chat" />
                    <FloatingLabel className="right-8 top-16" text="Stripe billing" />
                    <FloatingLabel className="bottom-16 left-1/2 -translate-x-1/2" text="Supabase auth" />
                  </div>
                </GlowCard>
              </motion.div>
            </RevealOnScroll>
          </div>
        </section>

        <SectionSeparator />

        <section className="py-32">
          <div className="mx-auto w-full max-w-7xl px-4">
            <RevealOnScroll>
              <p className="mb-8 text-center text-xs uppercase tracking-[0.2em] text-[hsl(var(--color-text-secondary))]">
                Built with the best
              </p>
            </RevealOnScroll>
            <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
              <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-8 hover:[animation-play-state:paused]">
                {[...stackLogos, ...stackLogos].map((logo, idx) => (
                  <div
                    key={`${logo}-${idx}`}
                    className="rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated)/0.6)] px-5 py-2 text-sm text-[hsl(var(--color-text-primary)/0.6)] transition-colors hover:text-[hsl(var(--color-text-primary))]"
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <SectionSeparator />

        <section id="features" className="py-32">
          <div className="mx-auto w-full max-w-7xl px-4">
            <RevealOnScroll className="mb-12 text-center">
              <h2 className="text-[clamp(2rem,5vw,3.8rem)] leading-tight">Everything you need to ship confidently</h2>
              <p className="mx-auto mt-4 max-w-2xl text-[hsl(var(--color-text-secondary))]">
                Built for founders and developers who care about velocity and code quality.
              </p>
            </RevealOnScroll>

            <div className="grid auto-rows-[170px] grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FeatureTile className="xl:col-span-2 xl:row-span-2" title="AI Chat with Streaming" icon={MessageSquare}>
                <div className="space-y-2 font-mono text-sm">
                  {[
                    "You: draft a launch announcement",
                    "Assistant: Drafting in real-time...",
                    "Assistant: Here's a polished version ↓",
                  ].map((line, i) => (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15, duration: 0.4 }}
                      className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg)/0.7)] px-3 py-2 text-[hsl(var(--color-text-secondary))]"
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              </FeatureTile>

              <FeatureTile className="xl:col-span-2 xl:row-span-1" title="Stripe Subscriptions" icon={CreditCard}>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--color-text-secondary))]">
                  {["Starter", "Pro", "Business"].map((tier) => (
                    <span key={tier} className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--color-border))] px-3 py-1">
                      <Check className="size-3 text-[hsl(var(--color-accent-soft))]" />
                      {tier}
                    </span>
                  ))}
                </div>
              </FeatureTile>

              <FeatureTile className="xl:col-span-1 xl:row-span-1" title="Supabase Auth" icon={ShieldCheck}>
                <p className="text-sm text-[hsl(var(--color-text-secondary))]">Login, signup, OAuth, and session handling out of the box.</p>
              </FeatureTile>

              <FeatureTile className="xl:col-span-1 xl:row-span-1" title="RLS Built-in" icon={Lock}>
                <p className="text-sm text-[hsl(var(--color-text-secondary))]">Safe multi-tenant defaults with strongly scoped policies.</p>
              </FeatureTile>

              <FeatureTile className="xl:col-span-2 xl:row-span-1" title="Type-safe end to end" icon={Type}>
                <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg)/0.7)] p-3 font-mono text-xs text-[hsl(var(--color-text-secondary))]">
                  <div className="animate-[shimmer_4s_linear_infinite] bg-[linear-gradient(90deg,hsl(var(--color-text-secondary)),hsl(var(--color-text-primary)),hsl(var(--color-text-secondary)))] bg-[length:180%_100%] bg-clip-text text-transparent">
                    {"type ChatMessage = Database[\"public\"][\"Tables\"][\"chat_messages\"][\"Row\"]"}
                  </div>
                </div>
              </FeatureTile>

              <FeatureTile className="xl:col-span-2 xl:row-span-1" title="Deploy to Vercel" icon={Zap}>
                <div className="space-y-1 rounded-xl border border-[hsl(var(--color-border))] bg-black/40 p-3 font-mono text-xs text-[hsl(var(--color-text-secondary))]">
                  {["$ pnpm build", "✓ Build complete", "$ vercel --prod", "✓ Deployment ready"].map((line, idx) => (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.18, duration: 0.3 }}
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              </FeatureTile>
            </div>
          </div>
        </section>

        <SectionSeparator />

        <section className="py-32">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 lg:grid-cols-2 lg:items-center">
            <RevealOnScroll>
              <p className="mb-2 text-sm text-[hsl(var(--color-accent-soft))]">AI integration in 10 lines</p>
              <h3 className="text-[clamp(1.8rem,4vw,3rem)] leading-tight">No boilerplate. No gotchas. Just ship.</h3>
              <CodePanel codeLines={codeLines} />
            </RevealOnScroll>
            <RevealOnScroll delay={0.08}>
              <GlowCard className="relative p-3" glow>
                <ChatMediaFallback />
              </GlowCard>
            </RevealOnScroll>
          </div>
        </section>

        <SectionSeparator />

        <section className="py-32">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="glass grid gap-6 rounded-2xl border border-[hsl(var(--color-border))] px-6 py-8 md:grid-cols-4">
              {[
                { value: 3, label: "Average deploy time", suffix: " min", format: "number" as const },
                { value: 100, label: "Type safe", suffix: "%", format: "percentage" as const },
                { value: 0, label: "of unnecessary boilerplate", suffix: " lines", format: "number" as const },
                { value: 10, label: "Faster than building from scratch", suffix: "×", format: "number" as const },
              ].map((stat, index) => (
                <div key={stat.label} className="relative text-center">
                  {index > 0 ? <span className="pointer-events-none absolute left-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-[hsl(var(--color-accent)/0.35)] md:block" /> : null}
                  <p className="text-4xl text-[hsl(var(--color-text-primary))]">
                    <AnimatedNumber value={stat.value} format={stat.format} />
                    {stat.suffix}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.1em] text-[hsl(var(--color-text-secondary))]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionSeparator />

        <section className="py-32">
          <div className="mx-auto w-full max-w-7xl px-4">
            <RevealOnScroll className="text-center">
              <h3 className="text-[clamp(2rem,5vw,3.4rem)]">Simple pricing. No surprises.</h3>
              <p className="mx-auto mt-3 max-w-2xl text-[hsl(var(--color-text-secondary))]">
                Start free, scale as your product and users grow.
              </p>
            </RevealOnScroll>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <RevealOnScroll key={plan.key}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "gradient-border glass relative rounded-2xl p-6",
                      plan.key === "pro" ? "shadow-[0_0_60px_-15px_hsl(var(--color-accent)/0.45)]" : ""
                    )}
                  >
                    {plan.key === "pro" ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-1 text-xs text-[hsl(var(--color-accent-soft))]">
                        Most popular
                      </span>
                    ) : null}
                    <h3 className="text-xl text-[hsl(var(--color-text-primary))]">{plan.name}</h3>
                    <p className="mt-3 text-5xl leading-none text-[hsl(var(--color-text-primary))]">
                      ${plan.price}
                      <span className="ml-1 text-sm text-[hsl(var(--color-text-secondary))]">/month</span>
                    </p>
                    <div className="my-5 h-px bg-[hsl(var(--color-border))]" />
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="inline-flex items-center gap-2 text-sm text-[hsl(var(--color-text-secondary))]">
                          <Check className="size-4 text-[hsl(var(--color-accent-soft))]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <MagneticButton
                        variant={plan.key === "pro" ? "primary" : "secondary"}
                        className="w-full"
                        onClick={() => router.push("/pricing")}
                      >
                        Choose plan
                      </MagneticButton>
                    </div>
                  </motion.div>
                </RevealOnScroll>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/pricing" className="text-sm text-[hsl(var(--color-accent-soft))] hover:text-[hsl(var(--color-text-primary))]">
                View full pricing
              </Link>
            </div>
          </div>
        </section>

        <SectionSeparator />

        <section className="py-32">
          <div className="mx-auto w-full max-w-7xl px-4">
            <RevealOnScroll className="text-center">
              <h3 className="text-[clamp(1.9rem,4.6vw,3.2rem)]">Frequently asked questions</h3>
            </RevealOnScroll>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {faqColumns.map((column, columnIndex) => (
                <Accordion key={`faq-col-${columnIndex}`} type="single" collapsible className="space-y-3">
                  {column.map((faq, idx) => (
                    <RevealOnScroll key={faq.q} delay={idx * 0.04}>
                      <AccordionItem
                        value={`${columnIndex}-${idx}`}
                        className="glass rounded-2xl border border-[hsl(var(--color-border))] px-5 data-[state=open]:shadow-[0_0_48px_-20px_hsl(var(--color-accent)/0.4)]"
                      >
                        <AccordionTrigger className="text-left text-[hsl(var(--color-text-primary))] [&>svg]:transition-transform [&>svg]:duration-300 [&[data-state=open]>svg]:rotate-180">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-[hsl(var(--color-text-secondary))]">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    </RevealOnScroll>
                  ))}
                </Accordion>
              ))}
            </div>
          </div>
        </section>

        <SectionSeparator />

        <section className="relative overflow-hidden py-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,hsl(16_60%_60%/0.18),transparent_60%)]" />
          <div className="relative mx-auto w-full max-w-7xl px-4 text-center">
            <RevealOnScroll>
              <h3 className="text-[clamp(2.1rem,6vw,4.4rem)] leading-tight">Start shipping your AI SaaS</h3>
              <p className="mx-auto mt-4 max-w-2xl text-[hsl(var(--color-text-secondary))]">
                Move from idea to production with a polished starter built for fast teams.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.08} className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton variant="primary" onClick={() => router.push("/signup")}>
                Get started free
                <ArrowRight className="size-4" />
              </MagneticButton>
              <MagneticButton variant="secondary" onClick={() => window.open(GITHUB_URL, "_blank", "noopener,noreferrer")}>
                <GitHubMark className="size-4" />
                View on GitHub
              </MagneticButton>
            </RevealOnScroll>
            <RevealOnScroll delay={0.14} className="mt-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated)/0.75)] px-4 py-2 text-sm text-[hsl(var(--color-text-secondary))]">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((id) => (
                    <span key={id} className="inline-block size-7 rounded-full border border-[hsl(var(--color-bg))] bg-[hsl(var(--color-surface))]" />
                  ))}
                </div>
                Join 1,000+ developers
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function FeatureTile({
  className,
  title,
  icon: Icon,
  children,
}: {
  className?: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <RevealOnScroll className={className}>
      <motion.article
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="gradient-border glass relative h-full rounded-2xl p-8"
      >
        <BorderBeam />
        <div className="relative z-10">
          <div className="mb-4 inline-flex size-9 items-center justify-center rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))]">
            <Icon className="size-4 text-[hsl(var(--color-accent-soft))]" />
          </div>
          <h3 className="mb-3 text-xl text-[hsl(var(--color-text-primary))]">{title}</h3>
          {children}
        </div>
      </motion.article>
    </RevealOnScroll>
  )
}

function FloatingLabel({ text, className }: { text: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("absolute z-10", className)}
    >
      <span className="inline-flex items-center rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated)/0.82)] px-3 py-1 text-xs text-[hsl(var(--color-text-primary))] shadow-[0_0_35px_-18px_hsl(var(--color-accent)/0.55)]">
        {text}
      </span>
    </motion.div>
  )
}

function CodePanel({ codeLines }: { codeLines: string[] }) {
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  const copyCode = async () => {
    const plain = codeLines.map((line) => line.replace(/<[^>]+>/g, "")).join("\n")
    await navigator.clipboard.writeText(plain)
    setCopied(true)
    setTimeout(() => setCopied(false), 1300)
  }

  return (
    <div ref={ref} className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] shadow-[inset_0_1px_0_hsl(var(--color-text-primary)/0.05)]">
      <div className="flex items-center justify-between border-b border-[hsl(var(--color-border))] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#ff5f56]" />
          <span className="size-2 rounded-full bg-[#ffbd2e]" />
          <span className="size-2 rounded-full bg-[#27c93f]" />
          <span className="ml-3 text-xs text-[hsl(var(--color-text-secondary))]">app/api/chat/route.ts</span>
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="rounded-lg border border-[hsl(var(--color-border))] px-2 py-1 text-xs text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-[hsl(var(--color-text-primary))]">
        {codeLines.map((line, index) => (
          <motion.div
            key={`line-${index}`}
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: index * 0.06, duration: 0.25 }}
            className={cn("block font-mono", line.includes("AI") ? "text-glow" : "")}
            dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
          />
        ))}
      </pre>
    </div>
  )
}

function ChatMediaFallback() {
  const [videoFailed, setVideoFailed] = useState(false)

  if (videoFailed) {
    return (
      <Image
        src="/marketing-chat-placeholder.svg"
        alt="Chat interface preview"
        width={960}
        height={720}
        sizes="(max-width: 1024px) 100vw, 560px"
        className="h-auto w-full rounded-xl"
      />
    )
  }

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      onError={() => setVideoFailed(true)}
      className="h-auto w-full rounded-xl border border-[hsl(var(--color-border))]"
      src="/preview-chat.mp4"
      poster="/marketing-chat-placeholder.svg"
    />
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
