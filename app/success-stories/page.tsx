"use client";

import Navbar from "@/components/Navbar";

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--on-surface)] mb-4">
            Success Stories
          </h1>
          <p className="text-lg text-[var(--on-surface-variant)] max-w-2xl mx-auto">
            Real stories from families who found their perfect matches through Izzatdar Parivar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--tertiary)] rounded-full flex items-center justify-center text-white font-bold text-sm">PA</div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--on-surface)]">Priya & Arjun</h3>
                <p className="text-sm text-[var(--on-surface-variant)]">Mumbai, Maharashtra</p>
              </div>
            </div>
            <p className="text-[var(--on-surface-variant)] leading-relaxed italic">
              &ldquo;We found each other on Izzatdar Parivar. The verified profiles gave us confidence, and the process was so dignified.&rdquo;
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--tertiary)] rounded-full flex items-center justify-center text-white font-bold text-sm">SR</div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--on-surface)]">Sunita & Rahul</h3>
                <p className="text-sm text-[var(--on-surface-variant)]">Jaipur, Rajasthan</p>
              </div>
            </div>
            <p className="text-[var(--on-surface-variant)] leading-relaxed italic">
              &ldquo;Our families are very traditional. This platform understood our values and helped us find the perfect match.&rdquo;
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--tertiary)] rounded-full flex items-center justify-center text-white font-bold text-sm">MK</div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--on-surface)]">Meera & Kiran</h3>
                <p className="text-sm text-[var(--on-surface-variant)]">Bengaluru, Karnataka</p>
              </div>
            </div>
            <p className="text-[var(--on-surface-variant)] leading-relaxed italic">
              &ldquo;Premium membership was worth every rupee. Direct contact details made it so much easier to connect.&rdquo;
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--tertiary)] rounded-full flex items-center justify-center text-white font-bold text-sm">RV</div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--on-surface)]">Rahul & Vidya</h3>
                <p className="text-sm text-[var(--on-surface-variant)]">Chennai, Tamil Nadu</p>
              </div>
            </div>
            <p className="text-[var(--on-surface-variant)] leading-relaxed italic">
              &ldquo;The family involvement feature was perfect for us. Our parents could review profiles and help us make the right decision.&rdquo;
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="font-serif text-3xl font-bold text-[var(--on-surface)] mb-4">Share Your Story</h2>
          <p className="text-[var(--on-surface-variant)] text-lg mb-8 max-w-2xl mx-auto">
            We'd love to hear about your success story! Contact us at support@izzatdar.com to share your experience.
          </p>
          <a href="/contact" className="border border-[var(--primary)] text-[var(--primary)] px-8 py-4 rounded-full font-semibold hover:bg-[var(--primary-container)] transition-colors">
            Contact Us
          </a>
        </div>
      </main>
    </div>
  );
}
