"use client"

import Link from "next/link"

import { Logo } from "@/components/ui/primitives/Logo"

const GITHUB_URL = "https://github.com/adarshparmar/nextjs-supabase-ai-saas-starter"
const TWITTER_URL = "https://x.com"
const LINKEDIN_URL = "https://linkedin.com/in/adarshparmar"

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[hsl(var(--color-border)/0.7)] bg-black">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-px overflow-hidden">
        <div className="h-1/3 w-px animate-[slide-up_6s_cubic-bezier(0.16,1,0.3,1)_infinite] bg-[linear-gradient(180deg,transparent,hsl(var(--color-accent-soft)/0.65),transparent)]" />
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="mb-10 space-y-3 border-b border-[hsl(var(--color-border)/0.55)] pb-8">
          <Logo size="lg" />
          <p className="max-w-xl text-sm text-[hsl(var(--color-text-secondary))]">
            Build production-grade AI SaaS products with premium UX, solid foundations, and a clean developer workflow.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-4">
          <FooterColumn
            title="Product"
            links={[
              { label: "Pricing", href: "/pricing" },
              { label: "Features", href: "/#features" },
              { label: "Roadmap", href: GITHUB_URL, external: true },
            ]}
          />
          <FooterColumn
            title="Resources"
            links={[
              { label: "Docs", href: "#" },
              { label: "Blog", href: "#" },
              { label: "Changelog", href: GITHUB_URL, external: true },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: "About", href: GITHUB_URL, external: true },
              { label: "Contact", href: GITHUB_URL, external: true },
              { label: "Careers", href: GITHUB_URL, external: true },
            ]}
          />
          <FooterColumn
            title="Legal"
            links={[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Security", href: GITHUB_URL, external: true },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--color-border)/0.55)] pt-6 text-xs text-[hsl(var(--color-text-secondary))] md:flex-row">
          <p>© {new Date().getFullYear()} SaaS Starter. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <SocialLink href={GITHUB_URL} label="GitHub">
              <GitHubMark className="size-4" />
            </SocialLink>
            <SocialLink href={TWITTER_URL} label="Twitter">
              <TwitterMark className="size-4" />
            </SocialLink>
            <SocialLink href={LINKEDIN_URL} label="LinkedIn">
              <LinkedInMark className="size-4" />
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: Array<{ label: string; href: string; external?: boolean }>
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-[hsl(var(--color-text-primary))]">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="text-sm text-[hsl(var(--color-text-secondary))] transition-colors hover:text-[hsl(var(--color-text-primary))]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex size-8 items-center justify-center rounded-lg border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-secondary))] transition-colors hover:text-[hsl(var(--color-text-primary))]"
    >
      {children}
    </Link>
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

function TwitterMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.632 7.584H.48l8.6-9.83L0 1.153h7.594l5.243 6.932 6.064-6.932Zm-1.291 19.36h2.039L6.486 3.404H4.298L17.61 20.514Z"
      />
    </svg>
  )
}

function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M4.983 3.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM3 9h4v12H3V9Zm7 0h3.833v1.687h.054C14.421 9.692 15.969 9 17.81 9 21.245 9 22 11.279 22 14.239V21h-4v-5.995c0-1.43-.026-3.268-1.993-3.268-1.996 0-2.301 1.56-2.301 3.166V21h-4V9Z"
      />
    </svg>
  )
}
