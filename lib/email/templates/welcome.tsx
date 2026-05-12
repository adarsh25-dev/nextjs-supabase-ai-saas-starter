import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"
import { getSiteUrl } from "@/lib/site-url"

export function WelcomeEmailTemplate({ name }: { name: string }) {
  const siteUrl = getSiteUrl()

  return (
    <Html>
      <Head />
      <Preview>Welcome to SaaS Starter</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Inter, Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "24px auto", padding: "24px", maxWidth: "560px" }}>
          <Heading style={{ margin: "0 0 12px" }}>Welcome, {name}</Heading>
          <Text style={{ color: "#334155", lineHeight: "1.6" }}>
            Your account is ready. You can start building your AI SaaS with auth, billing, and chat already wired.
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
