"use client"

export function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(65%_55%_at_50%_40%,black,transparent)]" />
    </div>
  )
}
