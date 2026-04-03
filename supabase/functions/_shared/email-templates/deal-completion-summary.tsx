/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Button, Section,
} from 'npm:@react-email/components@0.0.22'

interface DealCompletionSummaryProps {
  dealNumber?: string
  category?: string
  vendorName?: string
  dealValue?: string
  commissionEarned?: string
  siteUrl?: string
}

export const DealCompletionSummaryEmail = ({
  dealNumber = 'QAI-XXXXXXXX',
  category = 'general',
  vendorName = '',
  dealValue = '',
  commissionEarned = '',
  siteUrl = 'https://quantus-v2plus.lovable.app',
}: DealCompletionSummaryProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Deal {dealNumber} completed — QUANTUS V2+</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>QUANTUS V2+</Text>
        <Hr style={divider} />
        <Heading style={h1}>Deal Completed 🎉</Heading>
        <Text style={text}>
          Congratulations! Deal <strong style={{ color: '#b8942e' }}>{dealNumber}</strong> has been successfully completed.
        </Text>
        <Section style={summaryBox}>
          <Text style={summaryLabel}>Category</Text>
          <Text style={summaryValue}>{category}</Text>
          {vendorName && (
            <>
              <Text style={summaryLabel}>Vendor</Text>
              <Text style={summaryValue}>{vendorName}</Text>
            </>
          )}
          {dealValue && (
            <>
              <Text style={summaryLabel}>Deal Value</Text>
              <Text style={summaryValue}>{dealValue}</Text>
            </>
          )}
          {commissionEarned && (
            <>
              <Text style={summaryLabel}>Commission</Text>
              <Text style={summaryValue}>{commissionEarned}</Text>
            </>
          )}
        </Section>
        <Text style={text}>
          All documents have been archived and the commission has been logged. You can view the full deal history in your dashboard.
        </Text>
        <Button style={button} href={`${siteUrl}/dashboard`}>View Deal Summary</Button>
        <Text style={footer}>This is an automated notification from QUANTUS V2+.</Text>
        <Text style={copyright}>© 2026 QUANTUS V2+. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
)

export default DealCompletionSummaryEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '13px', fontWeight: '700' as const, letterSpacing: '0.25em', color: '#b8942e', margin: '0 0 16px', textTransform: 'uppercase' as const }
const divider = { borderColor: '#e8e0d0', margin: '0 0 32px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px' }
const summaryBox = { backgroundColor: '#faf8f4', borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px', border: '1px solid #e8e0d0' }
const summaryLabel = { fontSize: '11px', fontWeight: '600' as const, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#999', margin: '8px 0 2px' }
const summaryValue = { fontSize: '15px', color: '#1a1a1a', fontWeight: '600' as const, margin: '0 0 8px' }
const button = { backgroundColor: '#b8942e', color: '#0a0a0a', fontSize: '14px', fontWeight: '600' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '32px 0 0' }
const copyright = { fontSize: '11px', color: '#aaaaaa', margin: '24px 0 0' }
