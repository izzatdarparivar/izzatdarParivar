"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I know profiles are genuine?",
    answer:
      "Every profile on Izzatdar Parivar undergoes manual verification. Our team checks government-issued IDs and reviews each profile against our authenticity standards. No automated approvals — a real person reviews every submission.",
  },
  {
    question: "Is my contact number visible to everyone?",
    answer:
      "Absolutely not. Your contact details are hidden by default. Only premium members who you've expressed interest in can see your contact information, and only with mutual consent.",
  },
  {
    question: "Can I register on behalf of my child?",
    answer:
      "Yes! Many parents create profiles for their children. Simply select the appropriate relationship during registration. We encourage family involvement in the matchmaking process.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "You can delete your account anytime from your Dashboard → Settings → Delete Account. All your data will be permanently removed within 7 days. You can also email support@izzatdar.com for assistance.",
  },
  {
    question: "What languages is the platform available in?",
    answer:
      "Currently, Izzatdar Parivar is available in English and Hindi. We're working on adding support for regional languages including Marathi, Gujarati, Tamil, Telugu, and Bengali.",
  },
  {
    question: "What makes Izzatdar Parivar different from Shaadi.com?",
    answer:
      "We focus on quality over quantity. Every profile is manually verified, we maintain absolute privacy standards, and our platform is designed with family values at its core. We're not a dating app — we're a family connection platform.",
  },
  {
    question: "What if we don't find a match?",
    answer:
      "We're committed to your journey. Premium members get access to our concierge support team who can provide personalized recommendations. If you're unsatisfied after 6 months of premium, contact us for a full refund.",
  },
  {
    question: "Is there a mobile app available?",
    answer:
      "We're currently a web-first platform optimized for mobile browsers. A dedicated mobile app is in development and will be launching soon. Sign up for our newsletter to get notified!",
  },
];

export default function FAQAccordionSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-[var(--surface-container-low)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[var(--on-surface-variant)] max-w-xl mx-auto">
            Got questions? We&apos;ve got answers. If you don&apos;t find what
            you&apos;re looking for, feel free to contact us.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-[var(--outline-variant)]/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 rounded-2xl"
                aria-expanded={openIndex === index}
                aria-controls={`faq-panel-${index}`}
              >
                <h3 className="font-serif font-bold text-[var(--on-surface)] pr-4 text-base md:text-lg">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--primary)] flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    id={`faq-panel-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 md:px-6 pb-5 md:pb-6 text-[var(--on-surface-variant)] leading-relaxed text-sm md:text-base">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
