import type { TemplateEntry } from './registry.ts'
import { DealNegotiationProgressEmail } from '../email-templates/deal-negotiation-progress.tsx'

export const template = {
  component: DealNegotiationProgressEmail,
  subject: (data: Record<string, any>) => `Negotiation update for ${data.dealNumber || 'your deal'} — QUANTUS V2+`,
  displayName: 'Deal negotiation progress',
  previewData: { dealNumber: 'QAI-00001234', vendorName: 'Gulfstream Aerospace', stage: 'pricing review' },
} satisfies TemplateEntry
