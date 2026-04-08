/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>QUANTUS</Text>
        </Section>
        <Hr style={divider} />
        <Heading style={h1}>Reset Your Password</Heading>
        <Text style={text}>
          We received a request to reset your password for {siteName}. Select
          the button below to choose a new password.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Reset Password
          </Button>
        </Section>
        <Hr style={divider} />
        <Text style={footer}>
          If you did not request a password reset, you may disregard this
          message. Your password will remain unchanged.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
const buttonContainer = { textAlign: 'center' as const, margin: '8px 0 24px' }
const button = {
  backgroundColor: '#C4993A',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '14px 28px',
  textDecoration: 'none',
  letterSpacing: '0.5px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '10px 0 0', textAlign: 'center' as const }
