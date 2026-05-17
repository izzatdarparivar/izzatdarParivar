"use client";

import { Shield, Sparkles, AlertCircle } from "lucide-react";

interface Props {
  score: number;
}

export default function TrustBadge({ score }: Props) {
  const getTier = (s: number) => {
    if (s >= 90) return { label: "Platinum Family", color: "from-blue-600 to-indigo-700 text-white", ring: "ring-indigo-400" };
    if (s >= 75) return { label: "Gold Verified", color: "from-amber-500 to-yellow-600 text-white", ring: "ring-amber-400" };
    if (s >= 50) return { label: "Silver Verified", color: "from-slate-400 to-slate-500 text-white", ring: "ring-slate-300" };
    return { label: "Standard Profile", color: "from-gray-100 to-gray-200 text-gray-700", ring: "ring-gray-100" };
  };

  const tier = getTier(score);

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${tier.color} text-xs font-bold shadow-sm ring-2 ${tier.ring} select-none`}>
      <Shield className="w-3.5 h-3.5" />
      <span>{tier.label} ({score})</span>
      {score >= 75 && <Sparkles className="w-3 h-3 animate-pulse" />}
    </div>
  );
}
