"use client"

import posthog from "posthog-js"

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  try {
    posthog.capture(name, properties)
  } catch {
    // No-op when PostHog isn't configured.
  }
}
