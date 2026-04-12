"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, User, Globe2 } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      {/* Decorative bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-fixed)]/20 via-transparent to-[var(--secondary-container)]/20 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
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
          {/* Google OAuth */}
          <Button
            id="google-signup-btn"
            type="button"
            variant="outline"
            className="w-full rounded-full border-[var(--outline-variant)] text-[var(--on-surface)] mb-6 py-5"
            onClick={handleGoogle}
            disabled={loading}
          >
            <Globe2 className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--outline-variant)]/40" />
            </div>
            <div className="relative text-center text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container-lowest)] px-3 mx-auto w-fit">
              or sign up with email
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
