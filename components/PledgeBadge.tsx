"use client";

import { CheckCircle2, Heart } from "lucide-react";

export default function PledgeBadge() {
  return (
    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100 shadow-sm">
      <Heart className="w-3 h-3 fill-red-500 text-red-500" />
      <span>Signed Family Pledge</span>
    </div>
  );
}
