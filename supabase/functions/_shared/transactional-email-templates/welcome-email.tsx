/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "QUANTUS"
const SITE_URL = "https://quantus-v2plus.lovable.app"

interface WelcomeEmailProps {
  name?: string
}

const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — your concierge intelligence platform</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}><Text style={brand}>{SITE_NAME}</Text></Section>
        <Hr style={divider} />
        <Heading style={h1}>
          {name ? `Welcome aboard, ${name}` : 'Welcome aboard'}
        </Heading>
        <Text style={text}>
          Your {SITE_NAME} account is now active. You have access to our full suite of enterprise intelligence tools — from AI-powered deal sourcing to quantum analytics.
        </Text>
        <Section style={highlightSection}>
          <Text style={highlightTitle}>Here's what you can do next</Text>
          <Text style={highlightItem}>🔹 Submit your first deal request</Text>
          <Text style={highlightItem}>🔹 Explore the modules dashboard</Text>
          <Text style={highlightItem}>🔹 Complete your KYC verification</Text>
          <Text style={highlightItem}>🔹 Set up your account preferences</Text>
        </Section>
        <Section style={ctaSection}>
          <Button style={button} href={`${SITE_URL}/dashboard`}>
            Go to Dashboard
          </Button>
        </Section>
        <Text style={text}>
          Our concierge team is available to assist you with onboarding. Simply reach out via the in-app chat or contact form.
        </Text>
        <Text style={footer}>
          Best regards,<br />The {SITE_NAME} Concierge Team
        </Text>
        <Text style={copyright}>© 2026 {SITE_NAME}. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: (data: Record<string, any>) =>
    data.name ? `Welcome to QUANTUS, ${data.name}` : 'Welcome to QUANTUS',
  displayName: 'Welcome email',
  previewData: { name: 'Tyrone' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '520px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '8px' }
const brand = { fontSize: '14px', fontWeight: '600' as const, letterSpacing: '0.3em', color: '#C4993A', margin: '0' }
const divider = { borderColor: '#C4993A', borderWidth: '1px', margin: '16px 0 32px', opacity: 0.3 }
const h1 = { fontSize: '24px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 20px', fontFamily: "'Playfair Display', Georgia, serif" }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 20px' }
const highlightSection = { backgroundColor: '#f8f6f1', borderRadius: '8px', padding: '20px', margin: '0 0 24px' }
const highlightTitle = { fontSize: '14px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 12px' }
const highlightItem = { fontSize: '14px', color: '#4a4a4a', lineHeight: '1.4', margin: '0 0 6px' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const button = { backgroundColor: '#C4993A', color: '#ffffff', fontSize: '14px', fontWeight: '600' as const, padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', borderTop: '1px solid #eee', paddingTop: '20px' }
const copyright = { fontSize: '11px', color: '#aaaaaa', margin: '16px 0 0' }
