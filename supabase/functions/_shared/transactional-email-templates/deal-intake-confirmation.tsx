import type { TemplateEntry } from './registry.ts'
import { DealIntakeConfirmationEmail } from '../email-templates/deal-intake-confirmation.tsx'

export const template = {
  component: DealIntakeConfirmationEmail,
  subject: (data: Record<string, any>) => `Your request ${data.dealNumber || ''} has been received — QUANTUS V2+`,
  displayName: 'Deal intake confirmation',
  previewData: { dealNumber: 'QAI-00001234', category: 'aviation', rawInput: 'Looking for a Gulfstream G700 charter' },
} satisfies TemplateEntry
