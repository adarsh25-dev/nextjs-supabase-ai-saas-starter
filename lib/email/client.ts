import { Resend } from "resend"

export const resend =
  process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 0
    ? new Resend(process.env.RESEND_API_KEY)
    : null

export function getEmailFromAddress() {
  return process.env.RESEND_FROM_EMAIL || "SaaS Starter <noreply@example.com>"
}
