"use client";

import Navbar from "@/components/Navbar";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--on-surface)] mb-4">
            Premium Membership
          </h1>
          <p className="text-lg text-[var(--on-surface-variant)] max-w-2xl mx-auto">
            Unlock premium features to help you find your perfect match faster and with more confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc] text-center">
            <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-2">Free</h3>
            <p className="text-3xl font-serif font-bold text-[var(--primary)] mb-4">₹0</p>
            <p className="text-sm text-[var(--on-surface-variant)] mb-6">Forever</p>
            
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> Create profile</li>
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> Browse profiles</li>
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> Send 3 intro messages</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="text-[var(--primary)]">✗</span> View contact details</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="text-[var(--primary)]">✗</span> Unlimited expressions of interest</li>
            </ul>
            
            <button className="w-full bg-[var(--surface-container-lowest)] text-[var(--on-surface)] px-6 py-3 rounded-full font-semibold hover:bg-[var(--surface-container)] transition-colors">
              Get Started
            </button>
          </div>

          <div className="bg-gradient-to-br from-[var(--primary)]/10 to-[var(--tertiary)]/10 p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[var(--primary)]"></div>
            <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-2">Premium</h3>
            <p className="text-3xl font-serif font-bold text-[var(--primary)] mb-4">₹999</p>
            <p className="text-sm text-[var(--on-surface-variant)] mb-6">Per year</p>
            
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> Everything in Free</li>
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> View contact details</li>
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> Unlimited expressions of interest</li>
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> Priority listing</li>
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> Advanced search filters</li>
            </ul>
            
            <button className="w-full bg-[var(--primary)] text-white px-6 py-3 rounded-full font-semibold hover:bg-[var(--primary-fixed)] transition-colors">
              Get Premium Access
            </button>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(58,45,39,0.08)] border border-[#ede6dc] text-center">
            <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-2">Enterprise</h3>
            <p className="text-3xl font-serif font-bold text-[var(--primary)] mb-4">Custom</p>
            <p className="text-sm text-[var(--on-surface-variant)] mb-6">For organizations & institutions</p>
            
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> Everything in Premium</li>
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> Custom branding</li>
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> Dedicated support</li>
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> API access</li>
              <li className="flex items-center gap-2"><span className="text-[var(--primary)]">✓</span> Bulk profile management</li>
            </ul>
            
            <button className="w-full bg-[var(--surface-container-lowest)] text-[var(--on-surface)] px-6 py-3 rounded-full font-semibold hover:bg-[var(--surface-container)] transition-colors">
              Contact Sales
            </button>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="font-serif text-3xl font-bold text-[var(--on-surface)] mb-4">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-[#ede6dc]">
              <h3 className="font-serif font-bold text-[var(--on-surface)] mb-2">What happens after my subscription expires?</h3>
              <p className="text-[var(--on-surface-variant)]">Your profile remains active, but you'll lose access to premium features. You can renew at any time.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#ede6dc]">
              <h3 className="font-serif font-bold text-[var(--on-surface)] mb-2">Can I cancel anytime?</h3>
              <p className="text-[var(--on-surface-variant)]">Yes, you can cancel your subscription anytime. You'll retain premium access until the end of your billing period.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#ede6dc]">
              <h3 className="font-serif font-bold text-[var(--on-surface)] mb-2">Is my payment information secure?</h3>
              <p className="text-[var(--on-surface-variant)]">Yes, we use industry-standard encryption and never store your full credit card information on our servers.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
