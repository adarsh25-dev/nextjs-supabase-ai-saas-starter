import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

export function PasswordResetEmailTemplate({ resetUrl }: { resetUrl: string }) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Inter, Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "24px auto", padding: "24px", maxWidth: "560px" }}>
          <Heading style={{ margin: "0 0 12px" }}>Reset your password</Heading>
          <Text style={{ color: "#334155", lineHeight: "1.6" }}>
            Click the button below to reset your password.
          </Text>
          <Section style={{ marginTop: "20px" }}>
            <Button
              href={resetUrl}
              style={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                padding: "10px 16px",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              Reset password
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
