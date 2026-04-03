/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Button,
} from 'npm:@react-email/components@0.0.22'

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
    <Preview>Your request {dealNumber} has been received — QUANTUS V2+</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>QUANTUS V2+</Text>
        <Hr style={divider} />
        <Heading style={h1}>Request Received</Heading>
        <Text style={text}>
          Your deal request <strong style={{ color: '#b8942e' }}>{dealNumber}</strong> has been successfully submitted and classified under <strong>{category}</strong>.
        </Text>
        {rawInput && (
          <Text style={quote}>"{rawInput.length > 200 ? rawInput.slice(0, 200) + '…' : rawInput}"</Text>
        )}
        <Text style={text}>
          Our AI engine is now analysing your requirements and will begin sourcing options immediately. You'll receive an update once matching vendors are identified.
        </Text>
        <Button style={button} href={`${siteUrl}/dashboard`}>Track Your Request</Button>
        <Text style={footer}>This is an automated notification from QUANTUS V2+.</Text>
        <Text style={copyright}>© 2026 QUANTUS V2+. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
)

export default DealIntakeConfirmationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '13px', fontWeight: '700' as const, letterSpacing: '0.25em', color: '#b8942e', margin: '0 0 16px', textTransform: 'uppercase' as const }
const divider = { borderColor: '#e8e0d0', margin: '0 0 32px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px' }
const quote = { fontSize: '14px', color: '#666', lineHeight: '1.5', margin: '0 0 24px', padding: '12px 16px', borderLeft: '3px solid #b8942e', backgroundColor: '#faf8f4' }
const button = { backgroundColor: '#b8942e', color: '#0a0a0a', fontSize: '14px', fontWeight: '600' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '32px 0 0' }
const copyright = { fontSize: '11px', color: '#aaaaaa', margin: '24px 0 0' }
