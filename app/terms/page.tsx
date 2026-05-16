import Navbar from "@/components/Navbar";


export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-ambient">
          <h1 className="text-4xl font-serif font-bold text-[#800000] mb-8">Terms of Service</h1>
          <div className="prose prose-stone max-w-none text-[#3A2D27]/80">
            <p className="text-lg font-medium mb-6">Welcome to Izzatdar Parivar. By using our service, you agree to these terms.</p>
            
            <h2 className="text-2xl font-serif font-bold text-[#800000] mt-10 mb-4">1. Eligibility</h2>
            <p>You must be of legal marriageable age in your jurisdiction to use this platform. You represent that you are currently single and looking for a life partner.</p>


            <h2 className="text-2xl font-serif font-bold text-[#800000] mt-10 mb-4">2. User Conduct</h2>
            <p>Users must provide accurate information. Harassment, fraud, or misuse of other users' data will lead to immediate permanent ban.</p>


            <h2 className="text-2xl font-serif font-bold text-[#800000] mt-10 mb-4">3. Privacy</h2>
            <p>Your privacy is our priority. Please review our Privacy Policy to understand how we handle your data.</p>


            <h2 className="text-2xl font-serif font-bold text-[#800000] mt-10 mb-4">4. Premium Services</h2>
            <p>Premium subscriptions are non-refundable. They provide enhanced features but do not guarantee a match.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
