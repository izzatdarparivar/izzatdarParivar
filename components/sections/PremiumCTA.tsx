"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PremiumCTA() {
  return (
    <section className="bg-[var(--background)] py-20 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <div className="bg-[var(--surface-container-lowest)] rounded-[40px] p-10 lg:p-16 shadow-lg relative overflow-hidden border border-[var(--outline-variant)]">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--primary-fixed)]/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--secondary-container)]/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <Crown className="w-12 h-12 text-[var(--primary)] mx-auto mb-6 drop-shadow-sm" />
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[var(--on-surface)] mb-4">
            Unlock Premium Membership
          </h2>
          <p className="text-[var(--on-surface-variant)] mb-2 max-w-lg mx-auto">
            Get access to contact details, send unlimited expressions of
            interest, and get priority listing.
          </p>
          <p className="font-serif text-4xl font-bold text-[var(--primary)] mb-8">
            ₹999{" "}
            <span className="text-lg font-normal text-[var(--on-surface-variant)]">
              / year
            </span>
          </p>
          <Button
            asChild
            size="lg"
            className="gold-gradient text-white rounded-full px-10 py-6 text-base font-semibold shadow-ambient"
            id="premium-cta-btn"
          >
            <Link href="/auth/signup">Get Premium Access</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
