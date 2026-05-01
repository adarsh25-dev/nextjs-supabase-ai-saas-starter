"use client"

export function DotPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="dot-bg absolute inset-0 [mask-image:radial-gradient(55%_50%_at_50%_35%,black,transparent)]" />
    </div>
  )
}
