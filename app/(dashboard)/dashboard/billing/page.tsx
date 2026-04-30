import type { Metadata } from "next"
import Link from "next/link"

import { BillingEvents } from "@/components/billing/billing-events"
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button"
import { UsageMeter } from "@/components/billing/usage-meter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSubscription as getSubscription } from "@/lib/hooks/use-subscription"

export const metadata: Metadata = {
  title: "Billing — SaaS Starter",
  description: "Manage your plan, monitor usage, and update subscription details.",
}

export default async function BillingPage() {
  const subscription = await getSubscription()

  const planLabel = subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)
  const renewalDate = subscription.renewalDate
    ? new Date(subscription.renewalDate).toLocaleDateString()
    : "N/A"

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <BillingEvents />
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>Current Subscription</CardTitle>
            <Badge variant={subscription.isActive ? "default" : "secondary"}>{subscription.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Plan: <span className="font-medium text-foreground">{planLabel}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Renewal date: <span className="font-medium text-foreground">{renewalDate}</span>
          </p>
        </CardHeader>
        <CardContent>
          <UsageMeter used={subscription.usage} limit={subscription.limit} />
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-3">
          <ManageSubscriptionButton />
          <Button variant="outline" asChild>
            <Link href="/pricing">Upgrade Plan</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
