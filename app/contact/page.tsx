"use client";

import Navbar from "@/components/Navbar";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--on-surface)] mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-[var(--on-surface-variant)] max-w-2xl mx-auto">
            We're here to help you with any questions, feedback, or support you might need.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--primary-container)]/30 rounded-full flex items-center justify-center text-[var(--primary)]">
                  <span className="font-serif text-xl font-bold">📞</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[var(--on-surface)] mb-1">Phone Support</h3>
                  <p className="text-[var(--on-surface-variant)]">+91 70617 85692</p>
                  <p className="text-sm text-[var(--surface-dim)] mt-1">Mon-Fri: 9AM - 6PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--primary-container)]/30 rounded-full flex items-center justify-center text-[var(--primary)]">
                  <span className="font-serif text-xl font-bold">✉️</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[var(--on-surface)] mb-1">Email Support</h3>
                  <p className="text-[var(--on-surface-variant)]">support@izzatdar.com</p>
                  <p className="text-sm text-[var(--surface-dim)] mt-1">We respond within 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--secondary)] rounded-full flex items-center justify-center text-white">
                  <span className="font-serif text-xl font-bold">💬</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[var(--on-surface)] mb-1">WhatsApp</h3>
                  <p className="text-[var(--on-surface-variant)]">+91 70617 85692</p>
                  <p className="text-sm text-[var(--surface-dim)] mt-1">Our team responds within 2 hours</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="font-serif font-bold text-[var(--on-surface)] mb-4">Office Address</h3>
              <p className="text-[var(--on-surface-variant)]">
                Izzatdar Parivar<br />
                Mumbai, Maharashtra<br />
                India
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-6">Send us a Message</h2>
            
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[var(--on-surface)] mb-2">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full px-4 py-3 rounded-xl border border-[var(--outline-variant)]/20 bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--on-surface)] mb-2">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-3 rounded-xl border border-[var(--outline-variant)]/20 bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[var(--on-surface)] mb-2">Subject</label>
                <select 
                  id="subject" 
                  className="w-full px-4 py-3 rounded-xl border border-[var(--outline-variant)]/20 bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors appearance-none"
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="partnership">Business Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[var(--on-surface)] mb-2">Message</label>
                <textarea 
                  id="message" 
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--outline-variant)]/20 bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors"
                  placeholder="How can we help you today?"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-[var(--primary)] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[var(--primary-fixed)] transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="font-serif text-3xl font-bold text-[var(--on-surface)] mb-4">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-[#ede6dc]">
              <h3 className="font-serif font-bold text-[var(--on-surface)] mb-2">How long does it take to get a response?</h3>
              <p className="text-[var(--on-surface-variant)]">We aim to respond to all inquiries within 2 hours during business hours (9AM-6PM IST, Mon-Fri).</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#ede6dc]">
              <h3 className="font-serif font-bold text-[var(--on-surface)] mb-2">Do you offer phone consultations?</h3>
              <p className="text-[var(--on-surface-variant)]">Yes! Our dedicated relationship consultants are available for personalized guidance. Book a free consultation through our WhatsApp number.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#ede6dc]">
              <h3 className="font-serif font-bold text-[var(--on-surface)] mb-2">Can I request a demo for my organization?</h3>
              <p className="text-[var(--on-surface-variant)]">Absolutely! Contact our enterprise team at enterprise@izzatdar.com to schedule a personalized demo and discuss custom solutions.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
