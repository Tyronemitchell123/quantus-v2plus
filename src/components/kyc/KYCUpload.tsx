import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileCheck, Shield, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  userId: string;
  onComplete?: () => void;
}

const DOC_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's Licence" },
  { value: "national_id", label: "National ID Card" },
];

export default function KYCUpload({ userId, onComplete }: Props) {
  const [docType, setDocType] = useState("passport");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const uploadFile = async (file: File, category: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${category}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("kyc-documents").upload(path, file, { upsert: true });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return path;
  };

  const handleSubmit = async () => {
    if (!frontFile || !addressFile) {
      toast.error("Please upload at least ID front and address proof");
      return;
    }
    setLoading(true);
    try {
      const frontPath = await uploadFile(frontFile, "id-front");
      const backPath = backFile ? await uploadFile(backFile, "id-back") : null;
      const addressPath = await uploadFile(addressFile, "address-proof");

      const { error } = await supabase.from("kyc_verifications").insert({
        user_id: userId,
        document_type: docType,
        document_front_path: frontPath,
        document_back_path: backPath,
        address_proof_path: addressPath,
        status: "pending",
      } as any);

      if (error) throw error;

      // Update profile KYC status
      await supabase.from("profiles").update({ kyc_status: "pending" } as any).eq("user_id", userId);

      setSubmitted(true);
      toast.success("KYC documents submitted for review");
      onComplete?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit documents");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
        <CheckCircle2 className="text-primary mx-auto mb-4" size={40} />
        <h3 className="font-display text-lg font-medium text-foreground mb-2">Documents Submitted</h3>
        <p className="text-sm text-muted-foreground">Our team will review your verification within 24–48 hours.</p>
      </motion.div>
    );
  }

  const FileInput = ({ label, file, onFile, required }: { label: string; file: File | null; onFile: (f: File) => void; required?: boolean }) => (
    <label className="block cursor-pointer">
      <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 ${
        file ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/30"
      }`}>
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <FileCheck size={16} className="text-primary" />
            <span className="text-sm text-foreground truncate max-w-[200px]">{file.name}</span>
          </div>
        ) : (
          <div>
            <Upload size={20} className="mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">{label} {required && <span className="text-destructive">*</span>}</p>
          </div>
        )}
      </div>
      <input type="file" accept="image/*,.pdf" className="hidden"
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
    </label>
  );

  return (
    <Card className="border-border">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={18} className="text-primary" />
          <h3 className="font-display text-base font-medium text-foreground">Identity Verification</h3>
        </div>
        <p className="text-xs text-muted-foreground">Upload a government-issued ID and proof of address to verify your account.</p>

        <Select value={docType} onValueChange={setDocType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {DOC_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <FileInput label="ID Front" file={frontFile} onFile={setFrontFile} required />
          <FileInput label="ID Back (optional)" file={backFile} onFile={setBackFile} />
        </div>

        <FileInput label="Proof of Address (utility bill / bank statement)" file={addressFile} onFile={setAddressFile} required />

        <Button onClick={handleSubmit} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
          Submit Verification
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          Files are encrypted and stored securely in compliance with GDPR.
        </p>
      </CardContent>
    </Card>
  );
}
