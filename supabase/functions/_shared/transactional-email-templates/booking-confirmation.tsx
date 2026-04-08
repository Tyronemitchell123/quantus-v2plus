/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "QUANTUS"
const SITE_URL = "https://quantus-v2plus.lovable.app"

interface BookingConfirmationProps {
  name?: string
  dealNumber?: string
  serviceType?: string
  scheduledDate?: string
  location?: string
}

const BookingConfirmationEmail = ({ name, dealNumber, serviceType, scheduledDate, location }: BookingConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Booking confirmed{dealNumber ? ` — ${dealNumber}` : ''} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}><Text style={brand}>{SITE_NAME}</Text></Section>
        <Hr style={divider} />
        <Heading style={h1}>
          {name ? `${name}, your booking is confirmed` : 'Your booking is confirmed'}
        </Heading>
        <Text style={text}>
          We're pleased to confirm your booking. Our team is preparing everything to ensure a seamless experience.
        </Text>
        <Section style={detailsSection}>
          <Text style={detailsTitle}>Booking Details</Text>
          {dealNumber && <Text style={detailRow}><strong>Reference:</strong> {dealNumber}</Text>}
          {serviceType && <Text style={detailRow}><strong>Service:</strong> {serviceType}</Text>}
          {scheduledDate && <Text style={detailRow}><strong>Date:</strong> {scheduledDate}</Text>}
          {location && <Text style={detailRow}><strong>Location:</strong> {location}</Text>}
          {!dealNumber && !serviceType && !scheduledDate && !location && (
            <Text style={detailRow}>Your booking details are being finalised. A concierge will follow up shortly.</Text>
          )}
        </Section>
        <Section style={nextStepsSection}>
          <Text style={nextStepsTitle}>What happens next</Text>
          <Text style={nextStepsItem}>1. A dedicated concierge will review your requirements</Text>
          <Text style={nextStepsItem}>2. You'll receive a detailed itinerary or service brief</Text>
          <Text style={nextStepsItem}>3. Final confirmation before the scheduled date</Text>
        </Section>
        <Section style={ctaSection}>
          <Button style={button} href={`${SITE_URL}/dashboard`}>
            View in Dashboard
          </Button>
        </Section>
        <Text style={text}>
          Need to make changes? Contact our concierge team and we'll take care of everything.
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
  component: BookingConfirmationEmail,
  subject: (data: Record<string, any>) =>
    data.dealNumber
      ? `Booking confirmed — ${data.dealNumber}`
      : 'Your booking is confirmed',
  displayName: 'Booking confirmation',
  previewData: {
    name: 'James',
    dealNumber: 'QAI-A3B7C9D2',
    serviceType: 'Private Jet Charter',
    scheduledDate: '15 March 2026',
    location: 'London → Monaco',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '520px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '8px' }
const brand = { fontSize: '14px', fontWeight: '600' as const, letterSpacing: '0.3em', color: '#C4993A', margin: '0' }
const divider = { borderColor: '#C4993A', borderWidth: '1px', margin: '16px 0 32px', opacity: 0.3 }
const h1 = { fontSize: '24px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 20px', fontFamily: "'Playfair Display', Georgia, serif" }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 20px' }
const detailsSection = { backgroundColor: '#f8f6f1', borderLeft: '3px solid #C4993A', padding: '20px', margin: '0 0 24px', borderRadius: '0 4px 4px 0' }
const detailsTitle = { fontSize: '13px', fontWeight: '600' as const, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#999', margin: '0 0 12px' }
const detailRow = { fontSize: '14px', color: '#4a4a4a', lineHeight: '1.5', margin: '0 0 6px' }
const nextStepsSection = { backgroundColor: '#f0f8f0', borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px' }
const nextStepsTitle = { fontSize: '14px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 12px' }
const nextStepsItem = { fontSize: '14px', color: '#4a4a4a', lineHeight: '1.4', margin: '0 0 6px' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const button = { backgroundColor: '#C4993A', color: '#ffffff', fontSize: '14px', fontWeight: '600' as const, padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', borderTop: '1px solid #eee', paddingTop: '20px' }
const copyright = { fontSize: '11px', color: '#aaaaaa', margin: '16px 0 0' }
