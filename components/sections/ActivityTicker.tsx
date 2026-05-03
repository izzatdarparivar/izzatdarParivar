"use client";

import { Sparkles, Heart } from "lucide-react";

const tickerItems = [
  "A family from Jaipur found their match today",
  "14 new matches this morning in Mumbai",
  "New verified profiles added in Hyderabad",
  "A couple from Delhi got engaged through us",
  "8 families connected in Chennai this week",
  "Premium verified profile from Kolkata",
  "Parents in Pune found a match for their daughter",
  "3 new success stories from Bengaluru",
];

export default function ActivityTicker() {
  return (
    <section className="bg-[var(--surface-container)] py-4 overflow-hidden border-y border-[var(--outline-variant)]/10">
      <div className="relative flex items-center">
        <div className="animate-marquee flex gap-12 items-center whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div
              key={`${index}`}
              className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--tertiary)] flex-shrink-0" />
              <span className="font-medium">{item}</span>
              <Heart className="w-3 h-3 text-[var(--primary)]/40 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
}
