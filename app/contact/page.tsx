import Navbar from "@/components/Navbar";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";


export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-ambient text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 gold-gradient" />
          
          <h1 className="text-4xl font-serif font-bold text-[#800000] mb-4">Contact Us</h1>
          <p className="text-[#3A2D27]/60 max-w-xl mx-auto mb-12">
            Have questions or need assistance? Our dedicated support team is here to help you find your perfect match.
          </p>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-orange-50 border border-orange-100 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-white mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#800000] mb-2">Email Support</h3>
              <p className="text-sm text-[#3A2D27]/70">support@izzatdarparivar.com</p>
            </div>


            <div className="p-8 rounded-3xl bg-orange-50 border border-orange-100 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-white mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#800000] mb-2">Call Us</h3>
              <a href="tel:+917061785692" className="text-sm text-[#3A2D27]/70 hover:text-[#f97316] transition-colors">
                +91 70617 85692
              </a>
            </div>


            <div className="p-8 rounded-3xl bg-orange-50 border border-orange-100 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-white mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#800000] mb-2">Visit Office</h3>
              <p className="text-sm text-[#3A2D27]/70">Mumbai, Maharashtra, India</p>
            </div>
          </div>


          <div className="mt-16 p-8 rounded-3xl border-2 border-dashed border-orange-200">
            <MessageCircle className="w-12 h-12 text-[#f97316] mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-[#800000] mb-2">WhatsApp Support</h2>
            <p className="text-[#3A2D27]/60 mb-6">Available Mon-Sat, 9:00 AM - 7:00 PM</p>
            <a 
              href="https://wa.me/917061785692?text=Hello! I need support with my Izzatdar Parivar account." 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block gold-gradient text-white px-10 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
