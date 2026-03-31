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
  paymentUrl?: string
}

const PaymentReminderEmail = ({ customerName, dealCategory, dealNumber, amountDue, paymentUrl }: PaymentReminderProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Payment reminder for your {dealCategory || 'deal'} — {SITE_NAME}</Preview>
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
        {amountDue && (
          <Section style={amountSection}>
            <Text style={amountLabel}>Amount Due</Text>
            <Text style={amountValue}>{amountDue}</Text>
          </Section>
        )}
        <Text style={text}>
          Please complete your payment at your earliest convenience to ensure uninterrupted service
          and deal progression.
        </Text>
        {paymentUrl && (
          <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
            <Button style={button} href={paymentUrl}>
              Make Payment
            </Button>
          </Section>
        )}
        <Text style={text}>
          If you have already made this payment, please disregard this reminder.
          For any questions, our concierge team is available to assist.
        </Text>
        <Text style={footer}>Best regards, The {SITE_NAME} Team</Text>
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
    amountDue: '$12,500',
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
const button = { backgroundColor: '#C4993A', color: '#ffffff', padding: '14px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', borderTop: '1px solid #eee', paddingTop: '20px' }
