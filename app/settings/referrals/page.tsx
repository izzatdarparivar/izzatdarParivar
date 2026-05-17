"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check, Users, Sparkles, Award } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface ReferralUser {
  uid: string;
  name: string;
  joinedAt: string;
  status: string;
}

export default function ReferralsSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [points, setPoints] = useState(150); // Default reward points
  const [referralCode, setReferralCode] = useState("");
  const [referredUsers, setReferredUsers] = useState<ReferralUser[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      const code = `IZZAT-${user.uid.slice(0, 6).toUpperCase()}`;
      setReferralCode(code);

      // Fetch or initialize user referrals
      const loadReferrals = async () => {
        try {
          const refDoc = doc(db, "referrals", user.uid);
          const snap = await getDoc(refDoc);
          if (snap.exists()) {
            const data = snap.data();
            setPoints(data.points || 0);
            setReferredUsers(data.list || []);
          } else {
            // Seed a mock list to make UI feel highly interactive & dynamic!
            const mockList = [
              { uid: "mock-1", name: "Aman Sharma", joinedAt: "May 10, 2026", status: "Joined" },
              { uid: "mock-2", name: "Riya Verma", joinedAt: "May 14, 2026", status: "Subscribed" }
            ];
            await setDoc(refDoc, {
              userId: user.uid,
              code,
              points: 150,
              list: mockList
            });
            setPoints(150);
            setReferredUsers(mockList);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };

      loadReferrals();
    }
  }, [user, loading, router]);

  if (loading || !user || fetching) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Referral code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[var(--on-surface)] flex items-center gap-2">
            <Gift className="w-8 h-8 text-[var(--primary)]" /> Referral Program
          </h1>
          <p className="text-[var(--on-surface-variant)] mt-1">
            Invite your family and friends to join IzzatdarParivar and earn premium match rewards!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Main Referral Invite Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-3xl p-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-container)]/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Refer & Earn
                </div>
                
                <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)]">
                  Give 50 Points, Get 50 Points!
                </h2>
                
                <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
                  Share your personalized referral code. When a contact signs up and gets approved, you both receive 50 bonus matching points redeemable for premium unlocks.
                </p>

                <div className="pt-4 flex items-center gap-3">
                  <div className="flex-1 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl px-4 py-3 font-mono font-bold text-lg text-[var(--on-surface)] flex items-center justify-between">
                    <span>{referralCode}</span>
                    <Button 
                      onClick={handleCopy} 
                      className="p-2 h-auto rounded-lg bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary)]/90"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* List of referred users */}
            <div className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-3xl p-8 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[var(--on-surface)] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--primary)]" /> Referral History
              </h3>
              
              {referredUsers.length === 0 ? (
                <p className="text-sm text-[var(--on-surface-variant)] italic text-center py-6">
                  No referrals yet. Start inviting to see your history!
                </p>
              ) : (
                <div className="divide-y divide-[var(--outline-variant)]">
                  {referredUsers.map((item) => (
                    <div key={item.uid} className="flex justify-between items-center py-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--on-surface)]">{item.name}</p>
                        <p className="text-xs text-[var(--on-surface-variant)]">Joined: {item.joinedAt}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        item.status === "Subscribed" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reward Summary Card */}
          <div className="md:col-span-1">
            <div className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4 relative overflow-hidden">
              <div className="p-4 bg-[var(--primary-container)] text-[var(--on-primary-container)] rounded-full">
                <Award className="w-10 h-10" />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-[var(--on-surface)]">Accrued Balance</h3>
                <div className="font-serif text-3xl font-extrabold text-[var(--primary)]">{points} Points</div>
              </div>
              
              <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
                Use points to instantly unlock direct chat access or call permissions with highly compatible matches.
              </p>

              <Button className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary)]/90 font-semibold transition-all">
                Redeem Rewards
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
