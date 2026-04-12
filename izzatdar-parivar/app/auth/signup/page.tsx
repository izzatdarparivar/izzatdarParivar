"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, User, Globe2, Phone, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

export default function SignupPage() {
  const { signUp, signInWithGoogle, setupRecaptcha, sendPhoneOtp } = useAuth();
  const router = useRouter();
  
  // Tab State
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  
  // Generic Loading
  const [loading, setLoading] = useState(false);

  // Email State
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Phone State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [appVerifier, setAppVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // Initialize standard recaptcha when on phone tab
    if (authMethod === "phone" && !appVerifier) {
      const verifier = setupRecaptcha("recaptcha-container");
      setAppVerifier(verifier);
    }
  }, [authMethod, appVerifier, setupRecaptcha]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.name);
      toast.success("Account created! Please complete your profile.");
      router.push("/profile/create");
    } catch (err: any) {
      toast.error(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number (e.g., +919876543210)");
      return;
    }
    if (!appVerifier) {
      toast.error("Recaptcha not initialized. Please refresh the page.");
      return;
    }
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const result = await sendPhoneOtp(formattedPhone, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success("OTP sent successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send OTP. Try again.");
      if (appVerifier) appVerifier.render().then((widgetId) => appVerifier.reset(widgetId));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    if (!confirmationResult) return;

    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast.success("Phone verified! Please complete your profile.");
      // With phone auth, they technically have an account created in AuthContext listener now.
      // Easiest is to send them straight to dashboard which will redirect them to profile creation if incomplete.
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-fixed)]/20 via-transparent to-[var(--secondary-container)]/20 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-ambient">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[var(--on-surface)]">
            Create Your Account
          </h1>
          <p className="text-[var(--on-surface-variant)] mt-2 text-sm">
            Begin your journey to finding your life partner
          </p>
        </div>

        <div className="bg-[var(--surface-container-lowest)] rounded-3xl p-8 shadow-ambient">
          {/* View Toggle */}
          <div className="flex bg-[var(--surface-container-low)] p-1 rounded-full mb-6">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                authMethod === "email" ? "bg-white shadow-ambient text-[var(--primary)]" : "text-[var(--on-surface-variant)]"
              }`}
              onClick={() => setAuthMethod("email")}
            >
              Email Setup
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                authMethod === "phone" ? "bg-white shadow-ambient text-[var(--primary)]" : "text-[var(--on-surface-variant)]"
              }`}
              onClick={() => setAuthMethod("phone")}
            >
              Phone Setup
            </button>
          </div>

          {authMethod === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-[var(--on-surface-variant)]">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--outline)]" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    className="pl-10 rounded-full border-[var(--outline-variant)]/50 focus:border-[var(--primary)] bg-[var(--surface-container-low)]"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-[var(--on-surface-variant)]">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--outline)]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 rounded-full border-[var(--outline-variant)]/50 focus:border-[var(--primary)] bg-[var(--surface-container-low)]"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-[var(--on-surface-variant)]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--outline)]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    className="pl-10 rounded-full border-[var(--outline-variant)]/50 focus:border-[var(--primary)] bg-[var(--surface-container-low)]"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <Button
                id="signup-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full gold-gradient text-white rounded-full py-5 text-base font-semibold mt-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Recaptcha container */}
              <div id="recaptcha-container"></div>
              
              {!otpSent ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-phone" className="text-sm font-medium text-[var(--on-surface-variant)]">
                      Mobile Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--outline)]" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        className="pl-10 rounded-full border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)]"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSendOtp}
                    disabled={loading || !phone}
                    className="w-full gold-gradient text-white rounded-full py-5 text-base font-semibold mt-2"
                  >
                    {loading ? "Sending OTP..." : "Get OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-otp" className="text-sm font-medium text-[var(--on-surface-variant)]">
                      Enter OTP
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--outline)]" />
                      <Input
                        id="signup-otp"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="pl-10 rounded-full border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] text-center tracking-[0.5em] font-mono text-lg"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className="w-full gold-gradient text-white rounded-full py-5 text-base font-semibold mt-2"
                  >
                    {loading ? "Verifying..." : "Verify & Sign Up"}
                  </Button>
                  <button 
                    onClick={() => { setOtpSent(false); setOtp(""); setConfirmationResult(null); }}
                    className="w-full text-center text-xs text-[var(--on-surface-variant)] hover:text-[var(--primary)] mt-3"
                  >
                    Change Phone Number
                  </button>
                </>
              )}
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--outline-variant)]/40" />
            </div>
            <div className="relative text-center text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container-lowest)] px-3 mx-auto w-fit">
              or continue with Google
            </div>
          </div>

          <Button
            id="google-signup-btn"
            type="button"
            variant="outline"
            className="w-full rounded-full border-[var(--outline-variant)] text-[var(--on-surface)] py-5"
            onClick={handleGoogle}
            disabled={loading}
          >
            <Globe2 className="w-5 h-5 mr-2" />
            Google
          </Button>

          <p className="text-center text-sm text-[var(--on-surface-variant)] mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[var(--primary)] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
