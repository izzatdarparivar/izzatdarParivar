"use client";

import Navbar from "@/components/Navbar";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--on-surface)] mb-4">
            How It Works
          </h1>
          <p className="text-lg text-[var(--on-surface-variant)] max-w-2xl mx-auto">
            Our simple, secure, and dignified process to help you find your perfect match.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc] text-center">
            <div className="w-14 h-14 bg-[var(--primary-container)]/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="font-serif text-xl font-bold text-[var(--primary)]">1</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-3">Create Profile</h3>
            <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed">
              Sign up and build an authentic profile for you or your family member.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc] text-center">
            <div className="w-14 h-14 bg-[var(--primary-container)]/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="font-serif text-xl font-bold text-[var(--primary)]">2</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-3">Browse Matches</h3>
            <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed">
              Explore verified, compatible profiles that share your core values.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc] text-center">
            <div className="w-14 h-14 bg-[var(--primary-container)]/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="font-serif text-xl font-bold text-[var(--primary)]">3</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-3">Connect with Families</h3>
            <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed">
              Reach out with dignity and take the next step together.
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="font-serif text-3xl font-bold text-[var(--on-surface)] mb-4">Ready to Begin?</h2>
          <p className="text-[var(--on-surface-variant)] text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of families who have found their perfect matches through Izzatdar Parivar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/signup" className="bg-[var(--primary)] text-white px-8 py-4 rounded-full font-semibold hover:bg-[var(--primary-fixed)] transition-colors">
              Create Your Free Profile
            </a>
            <a href="/matches" className="border border-[var(--primary)] text-[var(--primary)] px-8 py-4 rounded-full font-semibold hover:bg-[var(--primary-container)] transition-colors">
              Browse Profiles
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
