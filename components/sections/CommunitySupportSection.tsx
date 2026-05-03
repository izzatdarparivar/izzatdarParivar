"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const communities = [
  { name: "Hindu", color: "#C96A4A" },
  { name: "Muslim", color: "#2F4F3E" },
  { name: "Sikh", color: "#D4A857" },
  { name: "Christian", color: "#6E7F4F" },
  { name: "Jain", color: "#C96A4A" },
  { name: "Buddhist", color: "#2F4F3E" },
  { name: "Parsi", color: "#D4A857" },
  { name: "Jewish", color: "#6E7F4F" },
];

export default function CommunitySupportSection() {
  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)] mb-4">
            Communities We Serve
          </h2>
          <p className="text-[var(--on-surface-variant)] max-w-2xl mx-auto leading-relaxed">
            Izzatdar Parivar proudly serves all communities across India. Our platform respects every tradition, custom, and cultural value.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto mb-12">
          {communities.map((community, index) => (
            <motion.span
              key={community.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="px-6 py-3 rounded-full text-sm font-semibold border-2 border-[var(--outline-variant)] bg-white text-[var(--on-surface)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-container)]/20 transition-all duration-200 cursor-default"
            >
              {community.name}
            </motion.span>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-8 py-4 rounded-full font-semibold hover:bg-[var(--primary-fixed)] transition-colors shadow-ambient"
          >
            Find matches within your community
          </Link>
        </div>
      </div>
    </section>
  );
}
