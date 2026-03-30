import type { TemplateEntry } from './registry.ts'
import { DealVendorMatchEmail } from '../email-templates/deal-vendor-match.tsx'

export const template = {
  component: DealVendorMatchEmail,
  subject: (data: Record<string, any>) => `Vendors matched for ${data.dealNumber || 'your deal'} — QUANTUS V2+`,
  displayName: 'Deal vendor match',
  previewData: { dealNumber: 'QAI-00001234', vendorCount: 3, topVendor: 'Gulfstream Aerospace' },
} satisfies TemplateEntry
