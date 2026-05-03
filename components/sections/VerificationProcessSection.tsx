"use client";

import { motion } from "framer-motion";
import { FileCheck, UserCheck, BadgeCheck, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: FileCheck,
    title: "Submit ID",
    description: "Upload a valid government ID for identity verification.",
  },
  {
    icon: UserCheck,
    title: "Manual Review",
    description: "Our team personally reviews every profile against our standards.",
  },
  {
    icon: BadgeCheck,
    title: "Profile Live",
    description: "Once approved, your profile goes live on the platform.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Badge",
    description: "Earn a verified badge that builds trust with other families.",
  },
];

export default function VerificationProcessSection() {
  return (
    <section className="py-20 bg-[var(--surface-container-low)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,var(--primary-container),transparent_70%)] pointer-events-none opacity-40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)] mb-4">
            Our Verification Process
          </h2>
          <p className="text-[var(--on-surface-variant)] max-w-2xl mx-auto leading-relaxed">
            What &ldquo;verified&rdquo; actually means — ID checked, profile reviewed by a human, no automated approvals. Every profile on Izzatdar Parivar goes through our thorough manual verification process.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[var(--surface-container-lowest)] rounded-2xl p-8 text-center shadow-ambient border border-[var(--border)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 bg-[var(--primary-container)]/50 rounded-full flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <div className="text-xs font-bold text-[var(--primary)] mb-2 uppercase tracking-widest">
                Step {index + 1}
              </div>
              <h3 className="font-serif text-lg font-bold text-[var(--on-surface)] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
