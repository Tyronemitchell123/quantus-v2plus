/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps { siteName: string; confirmationUrl: string }

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}><Text style={brand}>QUANTUS</Text></Section>
        <Hr style={divider} />
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>We received a request to reset your password for {siteName}. Click below to choose a new password.</Text>
        <Section style={buttonSection}><Button style={button} href={confirmationUrl}>Reset Password</Button></Section>
        <Text style={footer}>If you didn't request a password reset, you can safely ignore this email.</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '520px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '8px' }
const brand = { fontSize: '14px', fontWeight: '600' as const, letterSpacing: '0.3em', color: '#C4993A', margin: '0' }
const divider = { borderColor: '#C4993A', borderWidth: '1px', margin: '16px 0 32px', opacity: 0.3 }
const h1 = { fontSize: '24px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 20px', fontFamily: "'Playfair Display', Georgia, serif" }
const text = { fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 20px' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#C4993A', color: '#0a0a0c', fontSize: '13px', fontWeight: '600' as const, letterSpacing: '0.1em', borderRadius: '4px', padding: '14px 32px', textDecoration: 'none', textTransform: 'uppercase' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', borderTop: '1px solid #eee', paddingTop: '20px' }

