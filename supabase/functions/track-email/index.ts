import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

/**
 * Email tracking pixel and click redirect
 * GET /track-email?type=open&id=<email_log_id> — returns 1x1 transparent GIF
 * GET /track-email?type=click&id=<email_log_id>&url=<redirect_url> — logs click and redirects
 */
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "open";
  const emailLogId = url.searchParams.get("id");
  const redirectUrl = url.searchParams.get("url");

  if (!emailLogId) {
    return new Response("Missing id", { status: 400 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("email_events").insert({
      email_log_id: emailLogId,
      event_type: type,
      user_agent: req.headers.get("user-agent") || null,
      ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      metadata: redirectUrl ? { redirect_url: redirectUrl } : {},
    });
  } catch (e) {
    console.error("Track email error:", e);
  }

  if (type === "click" && redirectUrl) {
    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  }

  // 1x1 transparent GIF
  const gif = new Uint8Array([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
    0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
    0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
    0x01, 0x00, 0x3b,
  ]);

  return new Response(gif, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
});
