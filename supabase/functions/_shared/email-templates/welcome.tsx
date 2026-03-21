/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface WelcomeEmailProps {
  displayName: string
  siteUrl: string
}

export const WelcomeEmail = ({ displayName, siteUrl }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to QUANTUS AI — let's get started</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>QUANTUS AI</Text>
        <Hr style={divider} />
        <Heading style={h1}>Welcome aboard, {displayName}</Heading>
        <Text style={text}>
          Your QUANTUS AI account is ready. You now have access to quantum-enhanced intelligence, NLP tools, and advanced analytics.
        </Text>
        <Text style={text}>Here's what you can do next:</Text>
        <Text style={listItem}>⚛️ Run your first quantum circuit</Text>
        <Text style={listItem}>🧠 Explore NLP analysis tools</Text>
        <Text style={listItem}>📊 Set up anomaly detection alerts</Text>
        <Button style={button} href={siteUrl + '/dashboard'}>Go to Dashboard</Button>
        <Text style={footer}>
          Need help? Reply to this email or visit our documentation.
        </Text>
        <Text style={copyright}>© 2026 QUANTUS AI. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '13px', fontWeight: '700' as const, letterSpacing: '0.25em', color: '#b8942e', margin: '0 0 16px', textTransform: 'uppercase' as const }
const divider = { borderColor: '#e8e0d0', margin: '0 0 32px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px' }
const listItem = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }
const button = { backgroundColor: '#b8942e', color: '#0a0a0a', fontSize: '14px', fontWeight: '600' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '32px 0 0' }
const copyright = { fontSize: '11px', color: '#aaaaaa', margin: '24px 0 0' }
