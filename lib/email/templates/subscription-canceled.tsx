import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components"

export function SubscriptionCanceledEmailTemplate() {
  return (
    <Html>
      <Head />
      <Preview>Your subscription was canceled</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Inter, Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "24px auto", padding: "24px", maxWidth: "560px" }}>
          <Heading style={{ margin: "0 0 12px" }}>Subscription canceled</Heading>
          <Text style={{ color: "#334155", lineHeight: "1.6" }}>
            Your paid subscription is canceled. You can reactivate anytime from your billing page.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
