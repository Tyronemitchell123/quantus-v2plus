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

interface AccountNotificationEmailProps {
  displayName: string
  eventTitle: string
  eventDescription: string
  siteUrl: string
}

export const AccountNotificationEmail = ({ displayName, eventTitle, eventDescription, siteUrl }: AccountNotificationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{eventTitle} — QUANTUS V2+</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>QUANTUS V2+</Text>
        <Hr style={divider} />
        <Heading style={h1}>{eventTitle}</Heading>
        <Text style={text}>
          Hi {displayName}, we wanted to let you know about recent activity on your account:
        </Text>
        <Text style={eventBox}>{eventDescription}</Text>
        <Button style={button} href={siteUrl + '/settings'}>Review Account Settings</Button>
        <Text style={footer}>
          If this wasn't you, please secure your account immediately by resetting your password.
        </Text>
        <Text style={copyright}>© 2026 QUANTUS V2+. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
)

export default AccountNotificationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '13px', fontWeight: '700' as const, letterSpacing: '0.25em', color: '#b8942e', margin: '0 0 16px', textTransform: 'uppercase' as const }
const divider = { borderColor: '#e8e0d0', margin: '0 0 32px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px' }
const eventBox = { fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 24px', padding: '16px', backgroundColor: '#f9f7f3', borderRadius: '8px', border: '1px solid #e8e0d0' }
const button = { backgroundColor: '#b8942e', color: '#0a0a0a', fontSize: '14px', fontWeight: '600' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '32px 0 0' }
const copyright = { fontSize: '11px', color: '#aaaaaa', margin: '24px 0 0' }
