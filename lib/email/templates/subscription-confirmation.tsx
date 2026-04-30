import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components"

export function SubscriptionConfirmationEmailTemplate({
  plan,
}: {
  plan: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription is active</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Inter, Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "24px auto", padding: "24px", maxWidth: "560px" }}>
          <Heading style={{ margin: "0 0 12px" }}>Subscription confirmed</Heading>
          <Text style={{ color: "#334155", lineHeight: "1.6" }}>
            Thanks for subscribing. Your <strong>{plan}</strong> plan is now active.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
