"use client";


import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createQRProfile, getQRProfile, getQRCodeDataUrl, QRProfile } from "@/lib/qr-profile";


export default function QRProfilePage() {
  const { user } = useAuth();
  const [qrProfile, setQrProfile] = useState<QRProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);


  useEffect(() => {
    if (!user) return;
    loadQR();
  }, [user]);


  async function loadQR() {
    if (!user) return;
    try {
      const profile = await getQRProfile(user.uid);
      setQrProfile(profile);
    } catch {} finally { setLoading(false); }
  }


  async function handleGenerate() {
    if (!user) return;
    setGenerating(true);
    try {
      const profile = await createQRProfile(user.uid);
      setQrProfile(profile);
    } catch {} finally { setGenerating(false); }
  }


  function handleDownload() {
    if (!qrProfile) return;
    const link = document.createElement("a");
    link.href = getQRCodeDataUrl(qrProfile.url, 512);
    link.download = `izzatdar_qr_${qrProfile.shortCode}.png`;
    link.click();
  }


  function handleShare() {
    if (!qrProfile) return;
    if (navigator.share) {
      navigator.share({
        title: "My Izzatdar Parivar Profile",
        text: "View my matrimonial profile",
        url: qrProfile.url,
      });
    } else {
      navigator.clipboard.writeText(qrProfile.url);
    }
  }


  if (!user) return null;
  if (loading) return <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f97316] border-t-transparent" /></div>;


  return (
    <div className="min-h-screen bg-[#fff9f0] py-8 px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-serif text-[#800000] mb-2">QR Profile</h1>
        <p className="text-gray-500 mb-8">Share your profile offline with a QR code</p>


        {qrProfile ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <img
                src={getQRCodeDataUrl(qrProfile.url, 256)}
                alt="QR Code"
                className="mx-auto w-64 h-64 rounded-xl"
              />
            </div>


            <p className="text-sm text-gray-500 mb-1">Short Code</p>
            <p className="text-2xl font-mono font-bold text-[#800000] mb-4">{qrProfile.shortCode}</p>


            <p className="text-sm text-gray-500 mb-1">Profile URL</p>
            <p className="text-sm text-[#f97316] break-all mb-6">{qrProfile.url}</p>


            <div className="text-sm text-gray-400 mb-6">
              Scanned {qrProfile.scanCount} times
            </div>


            <div className="flex gap-3">
              <button onClick={handleDownload} className="flex-1 gold-gradient text-white py-3 rounded-full font-medium">
                Download QR
              </button>
              <button onClick={handleShare} className="flex-1 border-2 border-[#f97316] text-[#f97316] py-3 rounded-full font-medium">
                Share Link
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">📱</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">No QR Code Yet</h2>
            <p className="text-gray-500 mb-6">Generate a QR code to share your profile at events, with family, or in print.</p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="gold-gradient text-white px-8 py-3 rounded-full font-medium disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate QR Code"}
            </button>
          </div>
        )}


        {/* Tips */}
        <div className="mt-8 text-left bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-3">How to use your QR code:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Print it on your biodata for sharing at events</li>
            <li>• Share with family members for easy profile viewing</li>
            <li>• Include in community group posts</li>
            <li>• Add to your business card</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

