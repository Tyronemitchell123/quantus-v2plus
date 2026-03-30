import type { TemplateEntry } from './registry.ts'
import { DealSourcingUpdateEmail } from '../email-templates/deal-sourcing-update.tsx'

export const template = {
  component: DealSourcingUpdateEmail,
  subject: (data: Record<string, any>) => `Sourcing underway for ${data.dealNumber || 'your deal'} — QUANTUS V2+`,
  displayName: 'Deal sourcing update',
  previewData: { dealNumber: 'QAI-00001234', category: 'aviation', optionsCount: 5 },
} satisfies TemplateEntry
