import { useState } from "react";
import { Send, ChevronDown, ChevronUp, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateEmailBeforeSend } from "@/lib/email-validation";

const TEMPLATES = [
  "contact-confirmation",
  "deal-intake-confirmation",
  "deal-sourcing-update",
  "deal-vendor-match",
  "deal-negotiation-progress",
  "deal-completion-summary",
  "payment-reminder",
];

export default function SendTestEmailCard() {
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [template, setTemplate] = useState("contact-confirmation");
  const [templateData, setTemplateData] = useState('{ "name": "Test User" }');
  const [sending, setSending] = useState(false);

  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const handleSend = async () => {
    if (!recipient) {
      toast.error("Recipient email is required");
      return;
    }

    const validationError = await validateEmailBeforeSend(recipient);
    if (validationError) {
      setValidationWarning(validationError);
      toast.error(validationError);
      return;
    }
    setValidationWarning(null);

    let parsedData: Record<string, any> = {};
    try {
      parsedData = templateData.trim() ? JSON.parse(templateData) : {};
    } catch {
      toast.error("Invalid JSON in template data");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: template,
          recipientEmail: recipient,
          idempotencyKey: `test-${template}-${Date.now()}`,
          templateData: parsedData,
        },
      });

      if (error) throw error;
      toast.success(`Test email queued → ${recipient}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send test email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Send size={16} className="text-primary" />
                Send Test Email
              </span>
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            <Input
              placeholder="recipient@example.com"
              value={recipient}
              onChange={(e) => { setRecipient(e.target.value); setValidationWarning(null); }}
              type="email"
            />
            {validationWarning && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                <AlertTriangle size={12} />
                {validationWarning}
              </div>
            )}
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/-/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder='{ "name": "Test User" }'
              value={templateData}
              onChange={(e) => setTemplateData(e.target.value)}
              rows={3}
              className="font-mono text-xs"
            />
            <Button onClick={handleSend} disabled={sending} size="sm" className="w-full">
              {sending ? <Loader2 size={14} className="animate-spin mr-2" /> : <Send size={14} className="mr-2" />}
              Send Test Email
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
