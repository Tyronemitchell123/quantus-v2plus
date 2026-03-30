import type { TemplateEntry } from './registry.ts'
import { DealCompletionSummaryEmail } from '../email-templates/deal-completion-summary.tsx'

export const template = {
  component: DealCompletionSummaryEmail,
  subject: (data: Record<string, any>) => `Deal ${data.dealNumber || ''} completed — QUANTUS V2+`,
  displayName: 'Deal completion summary',
  previewData: { dealNumber: 'QAI-00001234', category: 'aviation', vendorName: 'Gulfstream', dealValue: '$4,200,000', commissionEarned: '$105,000' },
} satisfies TemplateEntry
