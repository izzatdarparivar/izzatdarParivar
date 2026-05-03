"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { howItWorks } from "@/lib/landing-data";

export default function HowItWorksSection() {
  return (
    <section className="py-16 lg:py-20 bg-[var(--background)]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)] mb-4">
            Simple. Secure. Dignified.
          </h2>
          <p className="text-[var(--on-surface-variant)] max-w-xl mx-auto">
            We&apos;ve made the process straightforward so you can focus on what
            matters.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-[var(--outline-variant)] -translate-y-1/2 z-0" />
          {howItWorks.map((step) => (
            <div
              key={step.title}
              className="bg-[var(--surface-container-lowest)] rounded-2xl p-8 shadow-ambient text-center relative z-10 border border-[var(--border)]"
            >
              <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-3">
                {step.title}
              </h3>
              <p className="text-[var(--on-surface-variant)] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            className="gold-gradient text-white rounded-full px-10 py-6 text-base font-semibold shadow-ambient sticky bottom-4 z-50 md:static md:bottom-auto"
          >
            <Link href="/auth/signup">Create Profile</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
