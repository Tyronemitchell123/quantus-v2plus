/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Button,
} from 'npm:@react-email/components@0.0.22'

interface DealNegotiationProgressProps {
  dealNumber?: string
  vendorName?: string
  stage?: string
  siteUrl?: string
}

export const DealNegotiationProgressEmail = ({
  dealNumber = 'QAI-XXXXXXXX',
  vendorName = '',
  stage = 'active negotiation',
  siteUrl = 'https://quantus-loom.lovable.app',
}: DealNegotiationProgressProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Negotiation update for {dealNumber} — QUANTUS V2+</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>QUANTUS V2+</Text>
        <Hr style={divider} />
        <Heading style={h1}>Negotiation Update</Heading>
        <Text style={text}>
          Deal <strong style={{ color: '#b8942e' }}>{dealNumber}</strong> has progressed to the <strong>Negotiation</strong> phase.
        </Text>
        <Text style={text}>
          {vendorName
            ? `Negotiations are underway with ${vendorName}. `
            : 'Negotiations are now underway with selected vendors. '}
          Current stage: <strong>{stage}</strong>.
        </Text>
        <Text style={highlight}>
          💼 Our AI has prepared negotiation leverage points and market comparisons to ensure the best possible terms for your deal.
        </Text>
        <Button style={button} href={`${siteUrl}/dashboard`}>View Negotiation Details</Button>
        <Text style={footer}>This is an automated notification from QUANTUS V2+.</Text>
        <Text style={copyright}>© 2026 QUANTUS V2+. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
)

export default DealNegotiationProgressEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '13px', fontWeight: '700' as const, letterSpacing: '0.25em', color: '#b8942e', margin: '0 0 16px', textTransform: 'uppercase' as const }
const divider = { borderColor: '#e8e0d0', margin: '0 0 32px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px' }
const highlight = { fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px', padding: '12px 16px', backgroundColor: '#f5f0e8', borderRadius: '8px' }
const button = { backgroundColor: '#b8942e', color: '#0a0a0a', fontSize: '14px', fontWeight: '600' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '32px 0 0' }
const copyright = { fontSize: '11px', color: '#aaaaaa', margin: '24px 0 0' }
