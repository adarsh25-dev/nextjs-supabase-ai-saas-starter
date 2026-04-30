# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Sentry instrumentation files for client, server, edge, and global error boundary.
- Security headers and CSP in Next.js config.
- Resend email client, React Email templates, and transactional send helpers.
- Stripe webhook idempotency migration: `stripe_webhook_events`.
- Dynamic SEO routes: `sitemap.xml`, `robots.txt`, and OG image endpoint.
- PostHog provider and analytics event tracking helpers.
- Route-level loading skeletons for dashboard, chat, and settings.
- Docs placeholder page and status indicator in marketing footer.

### Changed
- Wrapped API route handlers with explicit try/catch + `Sentry.captureException`.
- Improved chat UI resilience with retry action for transient network errors.
- Added account-deletion safety to cancel active Stripe subscriptions first.
- Upgraded marketing metadata with OpenGraph defaults and JSON-LD schemas.
- Refreshed README with badges, architecture, quick start, and roadmap.
