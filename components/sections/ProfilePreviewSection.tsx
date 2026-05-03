"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import { previewProfiles } from "@/lib/landing-data";

export default function ProfilePreviewSection() {
  return (
    <section className="py-24 bg-[var(--surface-container-low)]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)] mb-3">
              Recently Joined Profiles
            </h2>
            <p className="text-[var(--on-surface-variant)] text-lg">
              Join thousands of verified families looking for a genuine
              connection.
            </p>
          </div>
          <Button
            variant="link"
            asChild
            className="text-[var(--primary)] font-semibold mt-4 md:mt-0 px-0"
          >
            <Link href="/matches">
              View all profiles <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pointer-events-none select-none blur-[1px] opacity-90 transition-all duration-300 hover:blur-0 hover:opacity-100">
          {previewProfiles.map((p) => (
            <ProfileCard key={p.uid} profile={p as any} isPremiumViewer={false} />
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm font-medium text-[var(--on-surface-variant)] mb-4 bg-white/50 inline-block px-4 py-2 rounded-full border border-[rgba(208,197,175,0.2)] shadow-sm">
            Sign up to view complete details and contact them directly.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
