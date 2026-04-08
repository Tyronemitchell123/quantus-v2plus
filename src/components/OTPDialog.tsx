import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface OTPDialogProps {
  open: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<boolean>;
  isVerifying: boolean;
  purpose?: string;
}

const OTPDialog = ({ open, onClose, onVerify, isVerifying, purpose }: OTPDialogProps) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < text.length; i++) newDigits[i] = text[i];
    setDigits(newDigits);
    if (text.length === 6) inputRefs.current[5]?.focus();
  };

  const code = digits.join("");
  const isComplete = code.length === 6;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            Two-Factor Verification
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit code sent to your email to verify this {purpose?.replace(/_/g, " ") || "action"}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 my-6">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="w-11 h-14 text-center text-xl font-mono bg-secondary border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
            />
          ))}
        </div>

        <Button
          onClick={() => onVerify(code)}
          disabled={!isComplete || isVerifying}
          className="w-full"
        >
          {isVerifying ? "Verifying…" : "Verify"}
        </Button>

        <p className="text-[10px] text-center text-muted-foreground mt-2">
          Code expires in 10 minutes. Check your inbox and spam folder.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default OTPDialog;
