/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Button, Section,
} from 'npm:@react-email/components@0.0.22'

const SITE_NAME = "QUANTUS"

interface DealVendorMatchProps {
  dealNumber?: string
  vendorCount?: number
  topVendor?: string
  siteUrl?: string
}

export const DealVendorMatchEmail = ({
  dealNumber = 'QAI-XXXXXXXX',
  vendorCount = 0,
  topVendor = '',
  siteUrl = 'https://quantus-v2plus.lovable.app',
}: DealVendorMatchProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Vendors matched for {dealNumber} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{SITE_NAME}</Text>
        <Hr style={divider} />
        <Heading style={h1}>Vendor Match Complete ✓</Heading>
        <Text style={text}>
          Deal <strong style={{ color: '#C4993A' }}>{dealNumber}</strong> has entered the <strong>Matching</strong> phase.
        </Text>
        <Text style={text}>
          {vendorCount > 0
            ? `We've matched ${vendorCount} vendor${vendorCount > 1 ? 's' : ''} to your requirements.`
            : 'Vendors have been identified and matched to your requirements.'}
          {topVendor ? ` The top-ranked option is ${topVendor}.` : ''}
        </Text>
        <Section style={highlight}>
          <Text style={highlightText}>
            ✅ Outreach has been initiated. You'll be notified when vendor responses are received and negotiations can begin.
          </Text>
        </Section>
        <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
          <Button style={button} href={`${siteUrl}/dashboard`}>Review Matched Vendors →</Button>
        </Section>
        <Text style={footer}>
          This is an automated notification from {SITE_NAME}.<br />
          © 2026 {SITE_NAME}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default DealVendorMatchEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Outfit', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '520px', margin: '0 auto' }
const brand = { fontSize: '14px', fontWeight: '600' as const, letterSpacing: '0.3em', color: '#C4993A', margin: '0 0 16px', textTransform: 'uppercase' as const }
const divider = { borderColor: '#C4993A', borderWidth: '1px', margin: '0 0 32px', opacity: 0.3 }
const h1 = { fontSize: '24px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 20px', fontFamily: "'Playfair Display', Georgia, serif" }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px' }
const highlight = { backgroundColor: '#f0f8f0', borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px' }
const highlightText = { fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6', margin: '0' }
const button = { backgroundColor: '#C4993A', color: '#ffffff', fontSize: '14px', fontWeight: '600' as const, borderRadius: '6px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999999', lineHeight: '1.5', margin: '32px 0 0', borderTop: '1px solid #eee', paddingTop: '20px' }
