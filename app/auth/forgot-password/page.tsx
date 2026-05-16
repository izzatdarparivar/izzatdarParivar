"use client";


import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);


  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-ambient border border-orange-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#f97316]" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#800000]">Forgot Password</h1>
            <p className="text-[#3A2D27]/60 mt-2">Enter your email and we'll send you a link to reset your password.</p>
          </div>


          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-[#3A2D27]">Email Address</Label>
              <Input 
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-orange-100 focus:ring-orange-200"
                required
              />
            </div>


            <Button 
              type="submit" 
              className="w-full h-12 gold-gradient text-white rounded-xl font-bold shadow-lg"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>


          <div className="mt-8 pt-6 border-t border-orange-50 text-center">
            <Link href="/auth/login" className="text-[#f97316] font-bold flex items-center justify-center gap-2 hover:gap-3 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
