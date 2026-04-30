import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title") || "SaaS Starter"
  const subtitle = searchParams.get("subtitle") || "Next.js + Supabase AI SaaS starter"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background:
            "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(76,29,149,1) 50%, rgba(2,132,199,1) 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 24, opacity: 0.9, marginBottom: 16 }}>SaaS Starter</div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: "1000px" }}>{title}</div>
        <div style={{ marginTop: 24, fontSize: 30, opacity: 0.9 }}>{subtitle}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
