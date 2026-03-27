/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "quantus-loom"

interface ContactConfirmationProps {
  name?: string
  message?: string
}

const ContactConfirmationEmail = ({ name, message }: ContactConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your message — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}><Text style={brand}>QUANTUS</Text></Section>
        <Hr style={divider} />
        <Heading style={h1}>
          {name ? `Thank you, ${name}` : 'Thank you for reaching out'}
        </Heading>
        <Text style={text}>
          We have received your message and our concierge team will respond within 24 hours.
        </Text>
        {message && (
          <Section style={quoteSection}>
            <Text style={quoteText}>"{message}"</Text>
          </Section>
        )}
        <Text style={text}>
          In the meantime, feel free to explore our services or log in to your dashboard.
        </Text>
        <Text style={footer}>Best regards, The {SITE_NAME} Team</Text>
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
const quoteText = { fontSize: '14px', color: '#666', fontStyle: 'italic' as const, margin: '0', lineHeight: '1.5' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', borderTop: '1px solid #eee', paddingTop: '20px' }
