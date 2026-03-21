import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { WelcomeEmail } from '../_shared/email-templates/welcome.tsx'
import { ContactConfirmationEmail } from '../_shared/email-templates/contact-confirmation.tsx'
import { BookingConfirmationEmail } from '../_shared/email-templates/booking-confirmation.tsx'
import { AccountNotificationEmail } from '../_shared/email-templates/account-notification.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_NAME = 'quantus-loom'
const SENDER_DOMAIN = 'notify.crownprompts.com'
const FROM_DOMAIN = 'notify.crownprompts.com'
const SITE_URL = 'https://quantus-loom.lovable.app'

const EMAIL_TEMPLATES: Record<string, { component: React.ComponentType<any>; subject: string }> = {
  welcome: {
    component: WelcomeEmail,
    subject: 'Welcome to QUANTUS AI',
  },
  contact_confirmation: {
    component: ContactConfirmationEmail,
    subject: 'We received your message',
  },
  booking_confirmation: {
    component: BookingConfirmationEmail,
    subject: 'Your booking is confirmed',
  },
  account_notification: {
    component: AccountNotificationEmail,
    subject: 'Account activity alert',
  },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify the caller is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { template, to, data } = body as {
      template: string
      to: string
      data: Record<string, any>
    }

    if (!template || !to) {
      return new Response(JSON.stringify({ error: 'Missing template or to field' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const emailTemplate = EMAIL_TEMPLATES[template]
    if (!emailTemplate) {
      return new Response(JSON.stringify({ error: `Unknown template: ${template}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check suppression list
    const { data: suppressed } = await supabase
      .from('suppressed_emails')
      .select('id')
      .eq('email', to)
      .limit(1)

    if (suppressed && suppressed.length > 0) {
      return new Response(JSON.stringify({ error: 'Email address is suppressed', suppressed: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const templateProps = { ...data, siteUrl: SITE_URL }
    const html = await renderAsync(React.createElement(emailTemplate.component, templateProps))
    const text = await renderAsync(React.createElement(emailTemplate.component, templateProps), { plainText: true })

    const messageId = crypto.randomUUID()
    const subject = data?.subject || emailTemplate.subject

    // Log pending
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: template,
      recipient_email: to,
      status: 'pending',
    })

    // Enqueue
    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: 'transactional',
        label: template,
        queued_at: new Date().toISOString(),
      },
    })

    if (enqueueError) {
      console.error('Failed to enqueue transactional email', { error: enqueueError, template })
      await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: template,
        recipient_email: to,
        status: 'failed',
        error_message: 'Failed to enqueue email',
      })
      return new Response(JSON.stringify({ error: 'Failed to enqueue email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Transactional email enqueued', { template, to, messageId })

    return new Response(JSON.stringify({ success: true, queued: true, messageId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Transactional email error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
