import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { ContactConfirmationEmail } from '../_shared/email-templates/contact-confirmation.tsx'
import { rateLimit } from '../_shared/rate-limit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_NAME = 'QUANTUS'
const SENDER_DOMAIN = 'notify.crownprompts.com'
const SITE_URL = 'https://quantus-v2plus.lovable.app'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const rateLimited = rateLimit(req, corsHeaders)
    if (rateLimited) return rateLimited

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json()
    const { name, email, company, message } = body as {
      name: string
      email: string
      company?: string
      message: string
    }

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields: name, email, message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Save to contact_submissions
    const { error: insertError } = await supabase.from('contact_submissions').insert({
      name: name.slice(0, 100),
      email: email.slice(0, 255),
      company: company?.slice(0, 200) || null,
      message: message.slice(0, 5000),
    })

    if (insertError) {
      console.error('Failed to save contact submission', insertError)
    }

    // Check suppression list
    const { data: suppressed } = await supabase
      .from('suppressed_emails')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (suppressed && suppressed.length > 0) {
      console.log('Email suppressed, skipping confirmation', { email })
      return new Response(JSON.stringify({ success: true, emailSent: false, reason: 'suppressed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Render email
    const templateProps = { name, message, siteUrl: SITE_URL }
    const html = await renderAsync(React.createElement(ContactConfirmationEmail, templateProps))
    const text = await renderAsync(React.createElement(ContactConfirmationEmail, templateProps), { plainText: true })

    const messageId = crypto.randomUUID()
    const unsubscribeToken = crypto.randomUUID()

    await supabase.from('email_unsubscribe_tokens').insert({
      email,
      token: unsubscribeToken,
    })

    // Log pending
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'contact_confirmation',
      recipient_email: email,
      status: 'pending',
    })

    // Enqueue
    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: email,
        from: `${SITE_NAME} <noreply@${SENDER_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: 'We received your message — QUANTUS V2+',
        html,
        text,
        purpose: 'transactional',
        label: 'contact_confirmation',
        idempotency_key: `contact-${messageId}`,
        unsubscribe_token: unsubscribeToken,
        queued_at: new Date().toISOString(),
      },
    })

    if (enqueueError) {
      console.error('Failed to enqueue contact confirmation email', enqueueError)
      return new Response(JSON.stringify({ success: true, emailSent: false, error: 'enqueue_failed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Contact confirmation email enqueued', { email, messageId })

    return new Response(JSON.stringify({ success: true, emailSent: true, messageId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Handle contact error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
