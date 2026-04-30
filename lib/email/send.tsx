import * as Sentry from "@sentry/nextjs"

import { getEmailFromAddress, resend } from "@/lib/email/client"
import { PasswordResetEmailTemplate } from "@/lib/email/templates/password-reset"
import { SubscriptionCanceledEmailTemplate } from "@/lib/email/templates/subscription-canceled"
import { SubscriptionConfirmationEmailTemplate } from "@/lib/email/templates/subscription-confirmation"
import { WelcomeEmailTemplate } from "@/lib/email/templates/welcome"

async function sendEmail(params: {
  to: string
  subject: string
  react: React.ReactElement
}) {
  if (!resend || !params.to) return

  try {
    await resend.emails.send({
      from: getEmailFromAddress(),
      to: params.to,
      subject: params.subject,
      react: params.react,
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail({
    to,
    subject: "Welcome to SaaS Starter",
    react: <WelcomeEmailTemplate name={name} />,
  })
}

export async function sendSubscriptionConfirmationEmail(to: string, plan: string) {
  await sendEmail({
    to,
    subject: "Subscription confirmed",
    react: <SubscriptionConfirmationEmailTemplate plan={plan} />,
  })
}

export async function sendSubscriptionCanceledEmail(to: string) {
  await sendEmail({
    to,
    subject: "Subscription canceled",
    react: <SubscriptionCanceledEmailTemplate />,
  })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail({
    to,
    subject: "Reset your password",
    react: <PasswordResetEmailTemplate resetUrl={resetUrl} />,
  })
}
