"use client";


import { useState } from "react";
import { useAuth } from "@/context/AuthContext";


interface AiBioWriterProps {
  currentBio?: string;
  profileData: {
    name: string;
    age: number;
    gender: string;
    education: string;
    occupation: string;
    hobbies: string[];
    familyType: string;
    location: string;
    religion?: string;
  };
  onBioGenerated: (bio: string) => void;
}


export default function AiBioWriter({ currentBio, profileData, onBioGenerated }: AiBioWriterProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedBio, setGeneratedBio] = useState("");
  const [error, setError] = useState("");


  async function handleGenerate() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/ai/bio", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error("Failed to generate bio");
      const data = await res.json();
      setGeneratedBio(data.bio);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="bg-white rounded-2xl p-6 border border-orange-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">✨</span>
        <h3 className="font-semibold text-[#800000]">AI Bio Writer</h3>
      </div>


      {currentBio && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Current Bio:</p>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">{currentBio}</p>
        </div>
      )}


      {!generatedBio ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full gold-gradient text-white py-3 rounded-full font-medium disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Bio with AI"}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-orange-50 p-4 rounded-xl">
            <p className="text-sm text-gray-700">{generatedBio}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { onBioGenerated(generatedBio); setGeneratedBio(""); }}
              className="flex-1 gold-gradient text-white py-2 rounded-full text-sm font-medium"
            >
              Use This Bio
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 border border-[#f97316] text-[#f97316] py-2 rounded-full text-sm font-medium disabled:opacity-50"
            >
              {loading ? "..." : "Regenerate"}
            </button>
            <button
              onClick={() => setGeneratedBio("")}
              className="px-4 py-2 text-gray-500 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

