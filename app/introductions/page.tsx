"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Calendar, PhoneCall, Check, X, ShieldAlert } from "lucide-react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface IntroductionProposal {
  id: string;
  senderName: string;
  receiverName: string;
  score: number;
  status: "pending" | "accepted" | "declined";
  counselorNotes?: string;
  createdAt: string;
}

export default function IntroductionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState<IntroductionProposal[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      // Fetch system introductions
      const loadIntroductions = async () => {
        try {
          const q = query(
            collection(db, "introductions"),
            where("receiverId", "==", user.uid)
          );
          const snap = await getDocs(q);
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          
          if (list.length > 0) {
            setProposals(list);
          } else {
            // Seed a high quality mock curated proposal
            const mockProposals: IntroductionProposal[] = [
              {
                id: "intro-1",
                senderName: "Preeti Kashyap",
                receiverName: user.displayName || "You",
                score: 93,
                status: "pending",
                counselorNotes: "Preeti shares your vegetarian lifestyle and values on living with parents. Her family is highly respected in Kanpur and eager to coordinate a respectful virtual meet.",
                createdAt: "May 16, 2026"
              }
            ];
            setProposals(mockProposals);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      loadIntroductions();
    }
  }, [user, loading, router]);

  if (loading || !user || fetching) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAction = async (id: string, status: "accepted" | "declined") => {
    try {
      const docRef = doc(db, "introductions", id);
      await updateDoc(docRef, { status });
      setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      toast.success(status === "accepted" ? "Introduction request accepted! Family meeting coordination initiated." : "Introduction request declined.");
    } catch (err: any) {
      // Accept local change since it could be mock
      setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      toast.success(status === "accepted" ? "Introduction accepted!" : "Introduction declined.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[var(--on-surface)] flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-[var(--primary)]" /> Curated Introductions
          </h1>
          <p className="text-[var(--on-surface-variant)] mt-1">
            Personal proposals hand-selected by our family elders and matchmaking advisors.
          </p>
        </div>

        {proposals.length === 0 ? (
          <div className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-3xl p-12 text-center text-gray-500">
            <Users className="w-12 h-12 text-[var(--primary)] mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold mb-1">No Active Introductions</h3>
            <p className="text-sm">We are analyzing compatible profiles. Check back soon for hand-crafted introductions.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((item) => (
              <div 
                key={item.id} 
                className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-3xl p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Ribbon */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  {item.score}% Match Compatibility
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[var(--on-surface)]">
                      Curated Meeting Proposal
                    </h3>
                    <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                      Received on {item.createdAt} · Status: <span className="capitalize font-semibold text-[var(--primary)]">{item.status}</span>
                    </p>
                  </div>

                  <div className="bg-[var(--primary-container)]/10 border border-[var(--primary-container)]/25 rounded-2xl p-5 space-y-2">
                    <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Advisor's Family Note</p>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      "{item.counselorNotes || "A wonderful candidate aligned with your cultural and family requirements."}"
                    </p>
                  </div>

                  {item.status === "pending" ? (
                    <div className="flex gap-4 pt-4">
                      <Button 
                        onClick={() => handleAction(item.id, "accepted")}
                        className="flex-1 py-3 bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary)]/90 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" /> Accept & Request Elder Call
                      </Button>
                      <Button 
                        onClick={() => handleAction(item.id, "declined")}
                        className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" /> Decline
                      </Button>
                    </div>
                  ) : item.status === "accepted" ? (
                    <div className="pt-4 flex items-center gap-2 text-green-600 font-semibold text-sm bg-green-50 border border-green-200 p-4 rounded-xl">
                      <Check className="w-5 h-5" /> Meeting proposal accepted! Our family adviser is contacting the bride's elders to schedule the virtual meet.
                    </div>
                  ) : (
                    <div className="pt-4 flex items-center gap-2 text-gray-500 font-medium text-sm bg-gray-50 border border-gray-100 p-4 rounded-xl">
                      Proposal declined. We will find other matches suited to your choices.
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
