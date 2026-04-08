/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>QUANTUS</Text>
        </Section>
        <Hr style={divider} />
        <Heading style={h1}>Verification Code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Section style={codeContainer}>
          <Text style={codeStyle}>{token}</Text>
        </Section>
        <Hr style={divider} />
        <Text style={footer}>
          This code will expire shortly. If you did not request this, you may
          disregard this message.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Arial', sans-serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const header = { textAlign: 'center' as const, marginBottom: '10px' }
const logoText = {
  fontSize: '18px',
  fontFamily: "'Playfair Display', 'Georgia', serif",
  fontWeight: 'bold' as const,
  color: '#C4993A',
  letterSpacing: '4px',
  margin: '0',
}
const divider = { borderTop: '1px solid #E8E0D0', margin: '20px 0' }
const h1 = {
  fontSize: '24px',
  fontWeight: '600' as const,
  fontFamily: "'Playfair Display', 'Georgia', serif",
  color: '#0A0A0C',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#3A3A42',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const codeContainer = {
  textAlign: 'center' as const,
  backgroundColor: '#FAF7F2',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 24px',
  border: '1px solid #E8E0D0',
}
const codeStyle = {
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#C4993A',
  margin: '0',
  letterSpacing: '4px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '10px 0 0', textAlign: 'center' as const }
