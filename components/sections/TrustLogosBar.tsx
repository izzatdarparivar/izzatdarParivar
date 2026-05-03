"use client";

import { motion } from "framer-motion";

const logos = [
  { name: "Family Welfare Association", subtitle: "Trusted Partner" },
  { name: "Bharat Matrimony Alliance", subtitle: "Member" },
  { name: "India Trust Foundation", subtitle: "Certified" },
  { name: "Digital India Initiative", subtitle: "Recognized" },
  { name: "Safe Matrimony Certified", subtitle: "Verified Platform" },
  { name: "National Consumer Forum", subtitle: "Recommended" },
];

export default function TrustLogosBar() {
  return (
    <section className="py-12 bg-white border-y border-[var(--outline-variant)]/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-xs uppercase tracking-[0.2em] text-[var(--surface-dim)] font-semibold mb-2"
        >
          Trusted &amp; Recognized By
        </motion.p>
      </div>
      <div className="relative">
        <motion.div
          className="flex gap-12 items-center animate-marquee whitespace-nowrap"
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "linear",
          }}
        >
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="flex flex-col items-center gap-1 flex-shrink-0 px-6"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--surface-container)] flex items-center justify-center mb-1 border border-[var(--outline-variant)]/20">
                <span className="text-lg font-serif font-bold text-[var(--primary)]/50">
                  {logo.name.charAt(0)}
                </span>
              </div>
              <span className="text-xs font-semibold text-[var(--on-surface)]">
                {logo.name}
              </span>
              <span className="text-[10px] text-[var(--surface-dim)] uppercase tracking-wider">
                {logo.subtitle}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
