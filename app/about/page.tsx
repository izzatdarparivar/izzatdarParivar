"use client";

import Navbar from "@/components/Navbar";
import { Heart, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--on-surface)] mb-4">
            About Izzatdar Parivar
          </h1>
          <p className="text-lg text-[var(--on-surface-variant)] max-w-2xl mx-auto">
            We believe in finding the perfect match based on trust, heritage, and shared values. Our platform is dedicated to bringing families together with dignity and respect.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc] text-center">
            <div className="w-14 h-14 bg-[var(--primary-container)]/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-7 h-7 text-[var(--primary)]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-3">Trusted Matches</h3>
            <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed">
              Every profile goes through verification, ensuring you connect with genuine families looking for a serious commitment.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc] text-center">
            <div className="w-14 h-14 bg-[var(--primary-container)]/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-7 h-7 text-[var(--primary)]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-3">Privacy First</h3>
            <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed">
              Your data and family details are kept highly secure. We ensure complete control over who views your contact information.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc] text-center">
            <div className="w-14 h-14 bg-[var(--primary-container)]/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-7 h-7 text-[var(--primary)]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-3">Family Centric</h3>
            <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed">
              Marriage is a union of families. Our platform allows parents and individuals to communicate seamlessly to find the right cultural fit.
            </p>
          </div>
        </div>

        <div className="bg-[var(--primary-container)]/30 rounded-3xl p-8 md:p-12 border border-[#ede6dc] text-center">
          <h2 className="font-serif text-3xl font-bold text-[var(--on-surface)] mb-4">Our Mission</h2>
          <p className="text-[var(--on-surface-variant)] leading-relaxed max-w-3xl mx-auto text-lg italic">
            "To preserve the sanctity and heritage of Indian marriages by providing a modern, secure, and premium platform for families to find their ideal matches."
          </p>
        </div>
      </main>
    </div>
  );
}
