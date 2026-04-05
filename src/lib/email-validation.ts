import { supabase } from "@/integrations/supabase/client";

/**
 * Basic email format validation
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Check if an email is on the suppression list (bounced/unsubscribed/complained).
 * Returns the suppression reason if found, null otherwise.
 */
export async function checkSuppression(email: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('suppressed_emails')
      .select('reason')
      .eq('email', email.toLowerCase().trim())
      .limit(1)
      .maybeSingle();
    return data?.reason ?? null;
  } catch {
    return null; // fail open — don't block sends on lookup errors
  }
}

/**
 * Validates an email before sending. Returns an error message or null if valid.
 */
export async function validateEmailBeforeSend(email: string): Promise<string | null> {
  if (!isValidEmail(email)) {
    return 'Invalid email address format';
  }

  const suppressionReason = await checkSuppression(email);
  if (suppressionReason) {
    return `This email address has been suppressed (${suppressionReason}). Sending is blocked to protect deliverability.`;
  }

  return null;
}
