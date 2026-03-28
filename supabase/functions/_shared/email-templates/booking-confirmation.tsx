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
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface BookingConfirmationEmailProps {
  displayName: string
  bookingDetails: string
  bookingDate: string
  siteUrl: string
}

export const BookingConfirmationEmail = ({ displayName, bookingDetails, bookingDate, siteUrl }: BookingConfirmationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your booking is confirmed — QUANTUS V2+</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>QUANTUS V2+</Text>
        <Hr style={divider} />
        <Heading style={h1}>Booking confirmed</Heading>
        <Text style={text}>
          Hi {displayName}, your booking has been confirmed. Here are the details:
        </Text>
        <Text style={detailLabel}>Details</Text>
        <Text style={detailValue}>{bookingDetails}</Text>
        <Text style={detailLabel}>Date</Text>
        <Text style={detailValue}>{bookingDate}</Text>
        <Button style={button} href={siteUrl + '/dashboard'}>View in Dashboard</Button>
        <Text style={footer}>
          Need to make changes? Contact us by replying to this email.
        </Text>
        <Text style={copyright}>© 2026 QUANTUS V2+. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
)

export default BookingConfirmationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '13px', fontWeight: '700' as const, letterSpacing: '0.25em', color: '#b8942e', margin: '0 0 16px', textTransform: 'uppercase' as const }
const divider = { borderColor: '#e8e0d0', margin: '0 0 32px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px' }
const detailLabel = { fontSize: '13px', fontWeight: '600' as const, color: '#888888', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 4px' }
const detailValue = { fontSize: '15px', color: '#1a1a1a', fontWeight: '500' as const, margin: '0 0 16px' }
const button = { backgroundColor: '#b8942e', color: '#0a0a0a', fontSize: '14px', fontWeight: '600' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '32px 0 0' }
const copyright = { fontSize: '11px', color: '#aaaaaa', margin: '24px 0 0' }
