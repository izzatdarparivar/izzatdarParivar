"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function EmotionalQuote() {
  return (
    <section className="bg-gradient-to-b from-[var(--background)] to-[var(--surface-container)] py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <Heart className="w-10 h-10 mx-auto mb-6 text-[var(--primary)]" />
        <h2 className="font-serif text-3xl md:text-5xl font-bold leading-snug mb-4 text-[var(--on-surface)]">
          &ldquo;Marriage connects families,{" "}
          <br className="hidden sm:block" /> not just individuals.&rdquo;
        </h2>
        <p className="text-xl text-[var(--on-surface-variant)] max-w-2xl mx-auto leading-relaxed mb-3">
          We honor the traditions and values that make marriages meaningful,
          providing a platform designed for serious, long-term commitment.
        </p>
        <p className="text-sm font-serif italic text-[var(--surface-dim)]">
          — Izzatdar Parivar
        </p>
      </motion.div>
    </section>
  );
}
