"use client";


import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, CheckCircle, Zap, Eye, Star } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
}


declare global {
  interface Window {
    Razorpay: any;
  }
}


const benefits = [
  { icon: Eye, text: "View contact details of all matches" },
  { icon: Star, text: "Priority listing in search results" },
  { icon: Zap, text: "Send unlimited expressions of interest" },
  { icon: CheckCircle, text: "Premium trust badge on your profile" },
];


export default function PremiumModal({ open, onClose }: PremiumModalProps) {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };


  const handlePayment = async () => {
    if (!user) {
      toast.error("Please sign in first");
      router.push("/auth/login");
      return;
    }


    setLoading(true);


    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Check your internet connection.");
        return;
      }


      // Create Razorpay order on backend
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 99900,
          receipt: `premium_${user.uid}_${Date.now()}`,
        }),
      });


      if (!res.ok) throw new Error("Failed to create order");


      const order = await res.json();


      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Izzatdar Parivar",
        description: "Premium Membership — Annual",
        order_id: order.id,
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        notes: {
          uid: user.uid,
        },
        theme: {
          color: "#745b00",
        },
        handler: async (response: any) => {
          // Payment successful — webhook will update Firestore, but let's refresh the profile
          toast.success("Payment successful! Premium unlocked 🎉");
          await refreshProfile();
          onClose();
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };


      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl bg-[var(--surface-container-lowest)] border-0 shadow-2xl p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="gold-gradient p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5" />
          <Crown className="w-12 h-12 text-white mx-auto mb-3 drop-shadow-lg" />
          <DialogTitle className="font-serif text-2xl font-bold text-white">
            Premium Membership
          </DialogTitle>
          <p className="text-white/80 text-sm mt-1">
            Unlock the full Izzatdar Parivar experience
          </p>
        </div>


        <div className="p-8">
          <DialogDescription asChild>
            <div>
              {/* Benefits */}
              <ul className="space-y-3 mb-6">
                {benefits.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--primary-fixed)] rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                    <span className="text-sm text-[var(--on-surface)]">{text}</span>
                  </li>
                ))}
              </ul>


              {/* Price */}
              <div className="text-center py-4 bg-[var(--surface-container-low)] rounded-2xl mb-6">
                <p className="text-[var(--on-surface-variant)] text-sm">Annual Plan</p>
                <p className="font-serif text-4xl font-bold text-[var(--primary)] mt-1">
                  ₹999
                </p>
                <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                  ≈ ₹83/month · Cancel anytime
                </p>
              </div>


              {/* CTA */}
              <Button
                id="premium-pay-btn"
                onClick={handlePayment}
                disabled={loading}
                className="w-full gold-gradient text-white rounded-full py-5 text-base font-semibold shadow-ambient"
              >
                {loading ? "Processing..." : "Pay ₹999 & Unlock Premium"}
              </Button>


              <p className="text-center text-xs text-[var(--on-surface-variant)] mt-3">
                Secured by Razorpay · 100% Safe & Encrypted
              </p>
            </div>
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}



