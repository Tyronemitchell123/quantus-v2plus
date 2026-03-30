import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useDocumentHead from "@/hooks/use-document-head";

type Status = "loading" | "valid" | "already_unsubscribed" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  useDocumentHead({ title: "Unsubscribe | QUANTUS V2+", description: "Manage your QUANTUS V2+ email preferences." });
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const resp = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await resp.json();

        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already_unsubscribed");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("error");
      }
    };

    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus("success");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("already_unsubscribed");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-primary">QUANTUS</p>
        <div className="h-px bg-primary/20 w-16 mx-auto" />

        {status === "loading" && (
          <p className="text-muted-foreground font-body">Verifying your request...</p>
        )}

        {status === "valid" && (
          <>
            <h1 className="font-display text-2xl text-foreground">Unsubscribe</h1>
            <p className="text-muted-foreground font-body text-sm">
              Are you sure you want to unsubscribe from email notifications?
            </p>
            <button
              onClick={handleUnsubscribe}
              className="px-8 py-3 bg-primary text-primary-foreground font-body text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors"
            >
              Confirm Unsubscribe
            </button>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="font-display text-2xl text-foreground">Unsubscribed</h1>
            <p className="text-muted-foreground font-body text-sm">
              You have been successfully unsubscribed from our emails.
            </p>
          </>
        )}

        {status === "already_unsubscribed" && (
          <>
            <h1 className="font-display text-2xl text-foreground">Already Unsubscribed</h1>
            <p className="text-muted-foreground font-body text-sm">
              This email address has already been unsubscribed.
            </p>
          </>
        )}

        {status === "invalid" && (
          <>
            <h1 className="font-display text-2xl text-foreground">Invalid Link</h1>
            <p className="text-muted-foreground font-body text-sm">
              This unsubscribe link is invalid or has expired.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="font-display text-2xl text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground font-body text-sm">
              Please try again later or contact support.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
