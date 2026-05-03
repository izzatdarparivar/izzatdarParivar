"use client";

import { motion } from "framer-motion";
import { stats } from "@/lib/landing-data";

export default function StatsStrip() {
  return (
    <section className="bg-[var(--secondary)] py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-container)]/50 to-[var(--secondary-container)]/50 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-3xl font-bold text-[var(--secondary)]">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--on-surface)] mt-1 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
