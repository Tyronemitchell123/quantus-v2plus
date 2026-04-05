/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Button, Section,
} from 'npm:@react-email/components@0.0.22'

const SITE_NAME = "QUANTUS"

interface DealIntakeConfirmationProps {
  dealNumber?: string
  category?: string
  rawInput?: string
  siteUrl?: string
}

export const DealIntakeConfirmationEmail = ({
  dealNumber = 'QAI-XXXXXXXX',
  category = 'general',
  rawInput = '',
  siteUrl = 'https://quantus-v2plus.lovable.app',
}: DealIntakeConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your request {dealNumber} has been received — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{SITE_NAME}</Text>
        <Hr style={divider} />
        <Heading style={h1}>Request Received ✓</Heading>
        <Text style={text}>
          Your deal request <strong style={{ color: '#C4993A' }}>{dealNumber}</strong> has been successfully submitted and classified under <strong>{category}</strong>.
        </Text>
        {rawInput && (
          <Section style={quoteSection}>
            <Text style={quoteLabel}>Your request</Text>
            <Text style={quote}>"{rawInput.length > 200 ? rawInput.slice(0, 200) + '…' : rawInput}"</Text>
          </Section>
        )}
        <Section style={stepsSection}>
          <Text style={stepsTitle}>What happens next?</Text>
          <Text style={stepsItem}>1. Our AI engine analyses your requirements</Text>
          <Text style={stepsItem}>2. Vendors are sourced and scored automatically</Text>
          <Text style={stepsItem}>3. You'll receive an update once matches are ready</Text>
        </Section>
        <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
          <Button style={button} href={`${siteUrl}/dashboard`}>Track Your Request →</Button>
        </Section>
        <Text style={footer}>
          This is an automated notification from {SITE_NAME}.<br />
          © 2026 {SITE_NAME}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default DealIntakeConfirmationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Outfit', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '520px', margin: '0 auto' }
const brand = { fontSize: '14px', fontWeight: '600' as const, letterSpacing: '0.3em', color: '#C4993A', margin: '0 0 16px', textTransform: 'uppercase' as const }
const divider = { borderColor: '#C4993A', borderWidth: '1px', margin: '0 0 32px', opacity: 0.3 }
const h1 = { fontSize: '24px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 20px', fontFamily: "'Playfair Display', Georgia, serif" }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px' }
const quoteSection = { backgroundColor: '#f8f6f1', borderLeft: '3px solid #C4993A', padding: '16px 20px', margin: '0 0 24px', borderRadius: '0 4px 4px 0' }
const quoteLabel = { fontSize: '11px', fontWeight: '600' as const, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#999', margin: '0 0 8px' }
const quote = { fontSize: '14px', color: '#666', lineHeight: '1.5', margin: '0', fontStyle: 'italic' as const }
const stepsSection = { backgroundColor: '#f0f8f0', borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px' }
const stepsTitle = { fontSize: '14px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 12px' }
const stepsItem = { fontSize: '14px', color: '#4a4a4a', lineHeight: '1.4', margin: '0 0 6px' }
const button = { backgroundColor: '#C4993A', color: '#ffffff', fontSize: '14px', fontWeight: '600' as const, borderRadius: '6px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999999', lineHeight: '1.5', margin: '32px 0 0', borderTop: '1px solid #eee', paddingTop: '20px' }
