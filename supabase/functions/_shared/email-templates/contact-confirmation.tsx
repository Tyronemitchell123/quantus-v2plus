/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface ContactConfirmationEmailProps {
  name: string
  message: string
}

export const ContactConfirmationEmail = ({ name, message }: ContactConfirmationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your message — QUANTUS V2+</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>QUANTUS V2+</Text>
        <Hr style={divider} />
        <Heading style={h1}>Message received</Heading>
        <Text style={text}>
          Hi {name}, thank you for reaching out. We've received your message and our team will get back to you within 24 hours.
        </Text>
        <Text style={label}>Your message:</Text>
        <Text style={quote}>{message}</Text>
        <Text style={footer}>
          If you have additional questions, simply reply to this email.
        </Text>
        <Text style={copyright}>© 2026 QUANTUS V2+. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
)

export default ContactConfirmationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '13px', fontWeight: '700' as const, letterSpacing: '0.25em', color: '#b8942e', margin: '0 0 16px', textTransform: 'uppercase' as const }
const divider = { borderColor: '#e8e0d0', margin: '0 0 32px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px' }
const label = { fontSize: '13px', fontWeight: '600' as const, color: '#888888', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 8px' }
const quote = { fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px', padding: '16px', backgroundColor: '#f9f7f3', borderLeft: '3px solid #b8942e', borderRadius: '4px' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '32px 0 0' }
const copyright = { fontSize: '11px', color: '#aaaaaa', margin: '24px 0 0' }
