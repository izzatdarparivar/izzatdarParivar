"use client";


import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { calculateTrustScore, getVouchesForUser, TrustScore, Vouch } from "@/lib/trust-score";


export default function TrustScorePage() {
  const { user } = useAuth();
  const [score, setScore] = useState<TrustScore | null>(null);
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);


  async function loadData() {
    if (!user) return;
    try {
      const [trustScore, userVouches] = await Promise.all([
        calculateTrustScore(user.uid),
        getVouchesForUser(user.uid),
      ]);
      setScore(trustScore);
      setVouches(userVouches);
    } catch {} finally { setLoading(false); }
  }


  if (!user) return null;
  if (loading) return <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f97316] border-t-transparent" /></div>;


  const BREAKDOWN_LABELS: Record<string, { label: string; max: number }> = {
    profileCompletion: { label: "Profile Completion", max: 20 },
    verification: { label: "Identity Verification", max: 25 },
    communityVouches: { label: "Community Vouches", max: 20 },
    activityScore: { label: "Activity", max: 15 },
    responsiveness: { label: "Responsiveness", max: 10 },
    tenure: { label: "Membership Tenure", max: 10 },
  };


  return (
    <div className="min-h-screen bg-[#fff9f0] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif text-[#800000] mb-8">Community Trust Score</h1>


        {/* Score circle */}
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center mb-6">
          <div className="w-32 h-32 mx-auto rounded-full border-8 border-[#f97316] flex items-center justify-center">
            <span className="text-4xl font-bold text-[#800000]">{score?.score || 0}</span>
          </div>
          <p className="text-gray-500 mt-4">out of 100</p>
          <p className="text-sm text-gray-400 mt-1">{score?.vouches || 0} community vouches</p>
        </div>


        {/* Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-lg mb-4">Score Breakdown</h2>
          <div className="space-y-4">
            {score && Object.entries(score.breakdown).map(([key, value]) => {
              const info = BREAKDOWN_LABELS[key];
              const percentage = (value / info.max) * 100;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{info.label}</span>
                    <span className="font-medium">{value}/{info.max}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#f97316] rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* Vouches */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Vouches Received ({vouches.length})</h2>
          {vouches.length === 0 ? (
            <p className="text-gray-500 text-sm">No vouches yet. Ask family or friends to vouch for you!</p>
          ) : (
            <div className="space-y-3">
              {vouches.map((vouch) => (
                <div key={vouch.id} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{vouch.voucherName}</p>
                      <p className="text-xs text-gray-500 capitalize">{vouch.relationship.replace("_", " ")}</p>
                    </div>
                  </div>
                  {vouch.message && <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{vouch.message}&rdquo;</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

