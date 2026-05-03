"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "@/lib/landing-data";

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-[var(--surface-container-low)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)]">
            Love Stories
          </h2>
          <p className="text-[var(--on-surface-variant)] mt-3">
            Thousands of families have found happiness through us.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-[var(--surface-container-lowest)] rounded-2xl p-8 shadow-ambient border border-[rgba(208,197,175,0.1)]"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 gold-gradient rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-[var(--on-surface)]">{t.name}</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    {t.location}
                  </p>
                </div>
              </div>
              <p className="text-[var(--on-surface-variant)] leading-relaxed italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex mt-4 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[var(--primary)] fill-[var(--primary)]"
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
