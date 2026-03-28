import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOCUMENT_TEMPLATES: Record<string, Record<string, string[]>> = {
  aviation: ["LOI", "PPI Agreement", "Escrow Instructions", "Purchase Agreement", "Delivery Checklist", "Commission Agreement"],
  medical: ["Intake Form", "Treatment Plan Summary", "Consent Form", "Travel Itinerary", "Post-Care Plan"],
  staffing: ["Candidate Summary", "Interview Schedule", "Offer Letter", "Employment Contract", "Placement Fee Agreement"],
  lifestyle: ["Booking Confirmation", "Experience Itinerary", "Risk Disclosure", "Vendor Agreement"],
  logistics: ["Dispatch Order", "Compliance Document", "Route Plan", "Incident Report"],
  partnerships: ["Partnership Agreement", "Revenue Share Terms", "Joint Venture Outline"],
};

const COMMISSION_RATES: Record<string, number> = {
  aviation: 2.5, medical: 8, staffing: 15, lifestyle: 10, logistics: 5, partnerships: 12,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const rateLimited = rateLimit(req, corsHeaders);
    if (rateLimited) return rateLimited;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Generate documents for a deal
    if (action === "generate_documents") {
      const { deal_id } = await req.json();

      const { data: deal } = await supabase.from("deals").select("*").eq("id", deal_id).eq("user_id", user.id).single();
      if (!deal) return new Response(JSON.stringify({ error: "Deal not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const templates = DOCUMENT_TEMPLATES[deal.category] || DOCUMENT_TEMPLATES.lifestyle;

      // Get vendor info
      const { data: outreach } = await supabase.from("vendor_outreach").select("*").eq("deal_id", deal_id).eq("user_id", user.id);

      // Get user profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();

      const vendorInfo = outreach?.[0] || {};

      // Use AI to generate document content
      let aiDocs: any[] = [];
      if (lovableKey) {
        try {
          const aiRes = await fetch("https://ai.lovable.dev/api/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{
                role: "system",
                content: "You are a luxury document generator for Quantus V2+, a UHNW private intelligence platform. Generate professional, cinematic, luxury-grade documents. Return JSON array."
              }, {
                role: "user",
                content: `Generate ${templates.length} documents for a ${deal.category} deal.
Deal: ${deal.deal_number}, Category: ${deal.category}, Sub-category: ${deal.sub_category || 'N/A'}
Budget: ${deal.budget_currency} ${deal.budget_min || '0'} - ${deal.budget_max || 'TBD'}
Client: ${profile?.display_name || 'Client'}
Vendor: ${vendorInfo.vendor_name || 'Vendor TBD'}, Company: ${vendorInfo.vendor_company || 'TBD'}

Document types needed: ${templates.join(", ")}

Return a JSON array with objects: { "document_type": "...", "title": "...", "content": "...", "fields": { key: value pairs of auto-populated fields } }
Keep content professional, elegant, and UHNW-appropriate. Include placeholders like [SIGNATURE] and [DATE] where needed.`
              }],
              response_format: { type: "json_object" },
            }),
          });
          const aiData = await aiRes.json();
          const parsed = JSON.parse(aiData.choices?.[0]?.message?.content || "{}");
          aiDocs = parsed.documents || parsed || [];
        } catch (e) {
          console.warn("AI doc generation failed, using templates:", e);
        }
      }

      // Fallback or merge with templates
      const documents = templates.map((docType, i) => {
        const aiDoc = aiDocs.find((d: any) => d.document_type === docType) || aiDocs[i] || {};
        return {
          deal_id,
          user_id: user.id,
          document_type: docType,
          title: aiDoc.title || `${docType} — ${deal.deal_number}`,
          content: aiDoc.content || `[Auto-generated ${docType} for ${deal.category} deal ${deal.deal_number}]\n\nThis document requires review and signature.`,
          fields: aiDoc.fields || {
            deal_number: deal.deal_number,
            category: deal.category,
            client_name: profile?.display_name || "Client",
            vendor_name: vendorInfo.vendor_name || "TBD",
            date: new Date().toISOString().split("T")[0],
          },
          status: "draft",
        };
      });

      const { data: inserted, error } = await supabase.from("deal_documents").insert(documents).select();
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, documents: inserted }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Generate invoice for a deal
    if (action === "generate_invoice") {
      const { deal_id, invoice_type, custom_amount_cents } = await req.json();

      const { data: deal } = await supabase.from("deals").select("*").eq("id", deal_id).eq("user_id", user.id).single();
      if (!deal) return new Response(JSON.stringify({ error: "Deal not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data: outreach } = await supabase.from("vendor_outreach").select("*").eq("deal_id", deal_id).eq("user_id", user.id).limit(1);
      const vendor = outreach?.[0];

      const commissionRate = COMMISSION_RATES[deal.category] || 5;
      const dealValue = deal.deal_value_estimate ? Math.round(deal.deal_value_estimate * 100) : (deal.budget_max ? Math.round(deal.budget_max * 100) : 0);
      const commissionCents = custom_amount_cents || Math.round(dealValue * commissionRate / 100);

      const lineItems = [
        { description: `${deal.category.charAt(0).toUpperCase() + deal.category.slice(1)} — ${deal.sub_category || "Service"} Commission`, quantity: 1, unit_price_cents: commissionCents, total_cents: commissionCents },
      ];

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const { data: invoice, error } = await supabase.from("invoices").insert({
        deal_id,
        user_id: user.id,
        invoice_type: invoice_type || "commission",
        amount_cents: commissionCents,
        currency: deal.budget_currency || "GBP",
        line_items: lineItems,
        due_date: dueDate.toISOString(),
        status: "issued",
        recipient_name: vendor?.vendor_name || "Vendor",
        recipient_email: vendor?.vendor_email || null,
        notes: `Commission invoice for deal ${deal.deal_number}`,
      }).select().single();

      if (error) throw error;

      // Log commission
      await supabase.from("commission_logs").insert({
        deal_id,
        invoice_id: invoice.id,
        user_id: user.id,
        category: deal.category,
        deal_value_cents: dealValue,
        commission_rate: commissionRate,
        commission_cents: commissionCents,
        status: "expected",
        vendor_name: vendor?.vendor_name || "TBD",
      });

      return new Response(JSON.stringify({ success: true, invoice }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Send payment reminder
    if (action === "send_reminder") {
      const { invoice_id } = await req.json();

      const { data: invoice } = await supabase.from("invoices").select("*").eq("id", invoice_id).eq("user_id", user.id).single();
      if (!invoice) return new Response(JSON.stringify({ error: "Invoice not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const reminderCount = (invoice.reminder_count || 0) + 1;
      const tones = ["gentle", "firm", "escalation"];
      const tone = tones[Math.min(reminderCount - 1, 2)];

      const messages: Record<string, string> = {
        gentle: `A courteous reminder that invoice ${invoice.invoice_number} is now due.\nWe appreciate your timely attention.\n\nAmount: ${(invoice.amount_cents / 100).toFixed(2)} ${invoice.currency}`,
        firm: `This is a follow-up regarding invoice ${invoice.invoice_number}, which remains outstanding.\nKindly arrange payment at your earliest convenience.\n\nAmount: ${(invoice.amount_cents / 100).toFixed(2)} ${invoice.currency}`,
        escalation: `Invoice ${invoice.invoice_number} requires immediate attention.\nPlease confirm payment status or contact us to discuss arrangements.\n\nAmount: ${(invoice.amount_cents / 100).toFixed(2)} ${invoice.currency}`,
      };

      await supabase.from("invoices").update({
        reminder_count: reminderCount,
        last_reminder_at: new Date().toISOString(),
      }).eq("id", invoice_id);

      return new Response(JSON.stringify({ success: true, tone, message: messages[tone], reminder_count: reminderCount }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Mark invoice as paid
    if (action === "mark_paid") {
      const { invoice_id } = await req.json();

      await supabase.from("invoices").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", invoice_id).eq("user_id", user.id);
      
      // Update commission log
      await supabase.from("commission_logs").update({ status: "paid", paid_at: new Date().toISOString() }).eq("invoice_id", invoice_id).eq("user_id", user.id);

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get commission summary
    if (action === "commission_summary") {
      const { data: commissions } = await supabase.from("commission_logs").select("*").eq("user_id", user.id);

      const summary = {
        total_expected: 0,
        total_paid: 0,
        total_outstanding: 0,
        by_category: {} as Record<string, { expected: number; paid: number; count: number }>,
      };

      (commissions || []).forEach((c: any) => {
        summary.total_expected += c.commission_cents;
        if (c.status === "paid") summary.total_paid += c.commission_cents;
        else summary.total_outstanding += c.commission_cents;

        if (!summary.by_category[c.category]) summary.by_category[c.category] = { expected: 0, paid: 0, count: 0 };
        summary.by_category[c.category].expected += c.commission_cents;
        if (c.status === "paid") summary.by_category[c.category].paid += c.commission_cents;
        summary.by_category[c.category].count++;
      });

      return new Response(JSON.stringify({ success: true, summary, commissions }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Finalize deal — update status to completed
    if (action === "finalize") {
      const { deal_id } = await req.json();

      await supabase.from("deals").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", deal_id).eq("user_id", user.id);

      return new Response(JSON.stringify({ success: true, message: "Documentation Complete — Ready for Deal Completion." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    console.error("Document billing error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
