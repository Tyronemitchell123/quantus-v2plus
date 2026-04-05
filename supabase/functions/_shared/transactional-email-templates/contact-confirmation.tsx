/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "QUANTUS"

interface ContactConfirmationProps {
  name?: string
  message?: string
}

const ContactConfirmationEmail = ({ name, message }: ContactConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{name ? `${name}, we` : 'We'} received your message — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}><Text style={brand}>{SITE_NAME}</Text></Section>
        <Hr style={divider} />
        <Heading style={h1}>
          {name ? `Thank you, ${name}` : 'Thank you for reaching out'}
        </Heading>
        <Text style={text}>
          We've received your message and it's been assigned to our concierge team. You can expect a personalised response within <strong>24 hours</strong>.
        </Text>
        {message && (
          <Section style={quoteSection}>
            <Text style={quoteLabel}>Your message</Text>
            <Text style={quoteText}>"{message}"</Text>
          </Section>
        )}
        <Section style={nextStepsSection}>
          <Text style={nextStepsTitle}>What happens next?</Text>
          <Text style={nextStepsItem}>1. Our team reviews your enquiry</Text>
          <Text style={nextStepsItem}>2. We match you with the right specialist</Text>
          <Text style={nextStepsItem}>3. You'll receive a tailored response within 24h</Text>
        </Section>
        <Text style={text}>
          In the meantime, feel free to explore your dashboard or browse our services.
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
  component: ContactConfirmationEmail,
  subject: 'We received your message',
  displayName: 'Contact form confirmation',
  previewData: { name: 'James', message: 'I need a private jet charter to Monaco for 6 passengers.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '520px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '8px' }
const brand = { fontSize: '14px', fontWeight: '600' as const, letterSpacing: '0.3em', color: '#C4993A', margin: '0' }
const divider = { borderColor: '#C4993A', borderWidth: '1px', margin: '16px 0 32px', opacity: 0.3 }
const h1 = { fontSize: '24px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 20px', fontFamily: "'Playfair Display', Georgia, serif" }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 20px' }
const quoteSection = { backgroundColor: '#f8f6f1', borderLeft: '3px solid #C4993A', padding: '16px 20px', margin: '0 0 24px', borderRadius: '0 4px 4px 0' }
const quoteLabel = { fontSize: '11px', fontWeight: '600' as const, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#999', margin: '0 0 8px' }
const quoteText = { fontSize: '14px', color: '#666', fontStyle: 'italic' as const, margin: '0', lineHeight: '1.5' }
const nextStepsSection = { backgroundColor: '#f0f8f0', borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px' }
const nextStepsTitle = { fontSize: '14px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 12px' }
const nextStepsItem = { fontSize: '14px', color: '#4a4a4a', lineHeight: '1.4', margin: '0 0 6px' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', borderTop: '1px solid #eee', paddingTop: '20px' }
const copyright = { fontSize: '11px', color: '#aaaaaa', margin: '16px 0 0' }
