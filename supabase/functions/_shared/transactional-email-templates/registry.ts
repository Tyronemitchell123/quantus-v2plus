/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as contactConfirmation } from './contact-confirmation.tsx'
import { template as dealIntakeConfirmation } from './deal-intake-confirmation.tsx'
import { template as dealSourcingUpdate } from './deal-sourcing-update.tsx'
import { template as dealVendorMatch } from './deal-vendor-match.tsx'
import { template as dealNegotiationProgress } from './deal-negotiation-progress.tsx'
import { template as dealCompletionSummary } from './deal-completion-summary.tsx'
import { template as paymentReminder } from './payment-reminder.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'contact-confirmation': contactConfirmation,
  'deal-intake-confirmation': dealIntakeConfirmation,
  'deal-sourcing-update': dealSourcingUpdate,
  'deal-vendor-match': dealVendorMatch,
  'deal-negotiation-progress': dealNegotiationProgress,
  'deal-completion-summary': dealCompletionSummary,
  'payment-reminder': paymentReminder,
}
