/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "QUANTUS"

interface PaymentReminderProps {
  customerName?: string
  dealCategory?: string
  dealNumber?: string
  amountDue?: string
  dueDate?: string
  paymentUrl?: string
}

const PaymentReminderEmail = ({ customerName, dealCategory, dealNumber, amountDue, dueDate, paymentUrl }: PaymentReminderProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Payment reminder{dealNumber ? ` for ${dealNumber}` : ''} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}><Text style={brand}>{SITE_NAME}</Text></Section>
        <Hr style={divider} />
        <Heading style={h1}>
          {customerName ? `Hi ${customerName},` : 'Payment Reminder'}
        </Heading>
        <Text style={text}>
          This is a friendly reminder that payment is outstanding for your deal
          {dealNumber ? ` (${dealNumber})` : ''}{dealCategory ? ` in ${dealCategory}` : ''}.
        </Text>
        {(amountDue || dueDate) && (
          <Section style={amountSection}>
            {amountDue && (
              <>
                <Text style={amountLabel}>Amount Due</Text>
                <Text style={amountValue}>{amountDue}</Text>
              </>
            )}
            {dueDate && (
              <Text style={dueDateText}>Due by: {dueDate}</Text>
            )}
          </Section>
        )}
        <Text style={text}>
          Please complete your payment at your earliest convenience to ensure uninterrupted service and deal progression.
        </Text>
        {paymentUrl && (
          <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
            <Button style={button} href={paymentUrl}>
              Make Payment Now →
            </Button>
          </Section>
        )}
        <Section style={helpSection}>
          <Text style={helpTitle}>Need help?</Text>
          <Text style={helpText}>
            If you've already made this payment, please disregard this reminder. For questions about your invoice or payment options, our concierge team is ready to assist.
          </Text>
        </Section>
        <Text style={footer}>
          Best regards,<br />The {SITE_NAME} Concierge Team
        </Text>
        <Text style={copyright}>© 2026 {SITE_NAME}. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PaymentReminderEmail,
  subject: (data: Record<string, any>) =>
    `Payment reminder${data?.dealNumber ? ` — Deal ${data.dealNumber}` : ''}`,
  displayName: 'Payment reminder',
  previewData: {
    customerName: 'James',
    dealCategory: 'Aviation',
    dealNumber: 'QTX-0042',
    amountDue: '£12,500',
    dueDate: '15 April 2026',
    paymentUrl: 'https://example.com/pay',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '520px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '8px' }
const brand = { fontSize: '14px', fontWeight: '600' as const, letterSpacing: '0.3em', color: '#C4993A', margin: '0' }
const divider = { borderColor: '#C4993A', borderWidth: '1px', margin: '16px 0 32px', opacity: 0.3 }
const h1 = { fontSize: '24px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 20px', fontFamily: "'Playfair Display', Georgia, serif" }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 20px' }
const amountSection = { backgroundColor: '#f8f6f1', border: '1px solid #e8e2d6', borderRadius: '8px', padding: '20px', margin: '0 0 24px', textAlign: 'center' as const }
const amountLabel = { fontSize: '12px', color: '#999', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 4px' }
const amountValue = { fontSize: '28px', fontWeight: '700' as const, color: '#C4993A', margin: '0', fontFamily: "'Playfair Display', Georgia, serif" }
const dueDateText = { fontSize: '13px', color: '#666', margin: '8px 0 0' }
const button = { backgroundColor: '#C4993A', color: '#ffffff', padding: '14px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' }
const helpSection = { backgroundColor: '#f8f8f8', borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px' }
const helpTitle = { fontSize: '14px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 8px' }
const helpText = { fontSize: '13px', color: '#666', lineHeight: '1.5', margin: '0' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', borderTop: '1px solid #eee', paddingTop: '20px' }
const copyright = { fontSize: '11px', color: '#aaaaaa', margin: '16px 0 0' }
