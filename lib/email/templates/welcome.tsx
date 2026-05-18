import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand"
import { getSiteUrl } from "@/lib/site-url"

export function WelcomeEmailTemplate({ name }: { name: string }) {
  const siteUrl = getSiteUrl()

  return (
    <Html>
      <Head />
      <Preview>Welcome to {BRAND_NAME}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Inter, Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "24px auto", padding: "24px", maxWidth: "560px" }}>
          <Heading style={{ margin: "0 0 12px" }}>Welcome, {name}</Heading>
          <Text style={{ color: "#334155", lineHeight: "1.6" }}>
            {BRAND_TAGLINE} Your account is ready — open the dashboard to get started.
          </Text>
          <Section style={{ marginTop: "20px" }}>
            <Button
              href={`${siteUrl}/dashboard`}
              style={{
                backgroundColor: "#7c3aed",
                color: "#ffffff",
                padding: "10px 16px",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              Open dashboard
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
