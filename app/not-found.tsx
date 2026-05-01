import Link from "next/link"
import { Compass, Home, LayoutDashboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/primitives/EmptyState"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[72vh] w-full max-w-3xl items-center justify-center px-6 py-10">
      <EmptyState
        icon={<Compass className="size-5" />}
        title="Page not found"
        description="The link may be outdated, or this page has moved to a new location."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild>
              <Link href="/">
                <Home className="mr-1.5 size-4" />
                Go home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-1.5 size-4" />
                Open dashboard
              </Link>
            </Button>
          </div>
        }
      />
    </div>
  )
}
