"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { FileText, Download, Edit3, ArrowLeft, Heart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function BiodataPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user || !userProfile) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleDownload = () => {
    toast.success("Generating your premium heritage biodata PDF...");
    // Trigger print layout or download
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] print:bg-white text-gray-800">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 print:py-0 print:px-0">
        
        {/* Controls */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>

          <Button 
            onClick={handleDownload} 
            className="flex items-center gap-1.5 px-6 py-2.5 bg-red-700 text-white rounded-xl hover:bg-red-800 transition font-bold shadow-md"
          >
            <Download className="w-4 h-4" /> Export Print PDF
          </Button>
        </div>

        {/* Traditional Biodata Container */}
        <div className="bg-white border-8 border-double border-red-800/40 rounded-3xl p-8 sm:p-12 shadow-xl print:shadow-none print:border-none print:p-0 flex flex-col relative overflow-hidden">
          
          {/* Traditional Top Mandala Banner */}
          <div className="text-center space-y-3 mb-10">
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-red-800 uppercase tracking-widest">
              || Shri Ganeshaya Namah ||
            </h1>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-red-700">
              Matrimonial Biodata
            </h2>
            <div className="w-24 h-1 bg-red-700 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* Personal Details */}
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-bold text-red-800 border-b border-red-100 pb-1.5">
                Personal Details
              </h3>
              
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500 w-1/3">Full Name:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.name}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">Gender:</td><td className="py-2.5 font-semibold text-gray-800 capitalize">{userProfile.gender}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">Date of Birth:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.dob?.toDate?.()?.toLocaleDateString() || "Not provided"}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">Height:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.height || "Not provided"}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">Religion / Caste:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.religion} / {userProfile.caste || "Not set"}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">Mother Tongue:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.motherTongue || "Not provided"}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Education & Career */}
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-bold text-red-800 border-b border-red-100 pb-1.5">
                Education & Career
              </h3>
              
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500 w-1/3">Education:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.education}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">Occupation:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.occupation}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">Annual Income:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.annualIncome}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">Living in:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.location}</td></tr>
                </tbody>
              </table>
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start mt-8">
            
            {/* Family Background */}
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-bold text-red-800 border-b border-red-100 pb-1.5">
                Family Background
              </h3>
              
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500 w-1/3">Gotra:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.gotra || "Not specified"}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">Family Type:</td><td className="py-2.5 font-semibold text-gray-800">{(userProfile as any).familyType || "Joint Family"}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">About Family:</td><td className="py-2.5 font-semibold text-gray-800">{(userProfile as any).aboutFamily || "A traditional, respectful, well-settled family with high moral standards."}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-bold text-red-800 border-b border-red-100 pb-1.5">
                Contact Details
              </h3>
              
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500 w-1/3">Phone:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.phone}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">WhatsApp:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.whatsapp || userProfile.phone}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2.5 font-bold text-gray-500">Email:</td><td className="py-2.5 font-semibold text-gray-800">{userProfile.email}</td></tr>
                </tbody>
              </table>
            </div>

          </div>

          <div className="mt-10 pt-6 border-t border-red-800/20 text-center text-xs text-gray-400">
            || Generated via IzzatdarParivar Premium Heritage Biodata ||
          </div>

        </div>
      </main>
    </div>
  );
}
