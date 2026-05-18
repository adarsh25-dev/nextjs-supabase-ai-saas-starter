export const BRAND_NAME = "LaunchForge"

export const BRAND_TAGLINE =
  "Production AI SaaS starter · Auth, billing, streaming chat, and dashboard — ready to deploy."

/** Use with root layout `title.template` (`%s — LaunchForge`). */
export function brandSectionTitle(section: string) {
  return section
}

export function ogImageUrl(options?: { title?: string; subtitle?: string }) {
  const params = new URLSearchParams()
  if (options?.title) params.set("title", options.title)
  if (options?.subtitle) params.set("subtitle", options.subtitle)
  const query = params.toString()
  return query ? `/api/og?${query}` : "/api/og"
}
