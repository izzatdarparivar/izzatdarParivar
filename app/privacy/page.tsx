import Navbar from "@/components/Navbar";


export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-ambient">
          <h1 className="text-4xl font-serif font-bold text-[#800000] mb-8">Privacy Policy</h1>
          <div className="prose prose-stone max-w-none text-[#3A2D27]/80">
            <p className="text-lg font-medium mb-6">Your privacy is critically important to us at Izzatdar Parivar.</p>
            
            <h2 className="text-2xl font-serif font-bold text-[#800000] mt-10 mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as your name, contact details, demographic information, and photographs for your matrimonial profile.</p>


            <h2 className="text-2xl font-serif font-bold text-[#800000] mt-10 mb-4">2. How We Use Information</h2>
            <p>We use this information to create your profile, enable matchmaking, and facilitate communication between users. We do not sell your personal data to third parties.</p>


            <h2 className="text-2xl font-serif font-bold text-[#800000] mt-10 mb-4">3. Data Security</h2>
            <p>We implement robust security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>


            <h2 className="text-2xl font-serif font-bold text-[#800000] mt-10 mb-4">4. Your Rights</h2>
            <p>You can view, edit, or delete your personal information at any time through your profile settings.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
