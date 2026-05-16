"use client";


import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { AlertTriangle, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);


  if (!user || !user.email || user.emailVerified) return null;
  const hasPasswordProvider = user.providerData.some((p) => p.providerId === "password");
  if (!hasPasswordProvider) return null;


  const handleResend = async () => {
    if (cooldown) return;
    setSending(true);
    try {
      await sendEmailVerification(user);
      toast.success("Verification email sent! Check your inbox.");
      setCooldown(true);
      setTimeout(() => setCooldown(false), 60000);
    } catch (e: any) {
      if (e.code === "auth/too-many-requests") toast.error("Too many attempts. Please try again later.");
      else toast.error("Failed to send verification email");
    } finally { setSending(false); }
  };


  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-bold">Verify your email</span> to send messages and appear in search results.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleResend} disabled={sending || cooldown} className="border-amber-300 text-amber-700 hover:bg-amber-100 flex-shrink-0">
          {sending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Mail className="w-3 h-3 mr-1" />}
          {cooldown ? "Sent!" : "Resend Email"}
        </Button>
      </div>
    </div>
  );
}

