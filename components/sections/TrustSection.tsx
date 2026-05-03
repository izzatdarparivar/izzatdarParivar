"use client";

import { motion } from "framer-motion";
import { Shield, Crown, Users, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrustSection() {
  return (
    <section className="py-20 bg-[var(--surface-container-lowest)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-2 gap-16 items-center"
        >
          {/* Left — trust points */}
          <div>
            <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)] mb-6">
              Why families trust our platform
            </h2>
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-[var(--primary-container)] text-[var(--on-primary-container)] p-3 rounded-full">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--on-surface)]">
                    100% Verified Accounts
                  </h3>
                  <p className="text-[var(--on-surface-variant)]">
                    Every profile is manually checked for authenticity, ensuring
                    a safe environment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[var(--primary-container)] text-[var(--on-primary-container)] p-3 rounded-full">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--on-surface)]">
                    Absolute Privacy
                  </h3>
                  <p className="text-[var(--on-surface-variant)]">
                    Your contact details and sensitive information are never
                    shared publicly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[var(--primary-container)] text-[var(--on-primary-container)] p-3 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--on-surface)]">
                    Dignified Experience
                  </h3>
                  <p className="text-[var(--on-surface-variant)]">
                    Built to respect cultural sensitivities and familial
                    involvement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — contact reassurance card */}
          <div className="bg-[var(--surface-container-low)] rounded-[30px] p-8 md:p-10 text-center shadow-ambient border border-[rgba(249,115,22,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-fixed)]/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <h3 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-4">
              Need Reassurance? We&apos;re Here.
            </h3>
            <p className="text-[var(--on-surface-variant)] mb-8">
              Our support team is ready to assist you or your parents with any
              questions you might have about the platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                className="rounded-full py-6 px-8 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                +91 70617 85692
              </Button>
              <Button className="rounded-full py-6 px-8 bg-[var(--secondary)] hover:bg-[var(--secondary)]/90 text-white">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp Us
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
