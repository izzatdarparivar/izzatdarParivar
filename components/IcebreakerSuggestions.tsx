"use client";


import { useState } from "react";
import { useAuth } from "@/context/AuthContext";


interface IcebreakerSuggestionsProps {
  receiverName: string;
  sharedInterests: string[];
  compatibilityScore: number;
  receiverBio?: string;
  onSelect: (message: string) => void;
}


export default function IcebreakerSuggestions({
  receiverName,
  sharedInterests,
  compatibilityScore,
  receiverBio,
  onSelect,
}: IcebreakerSuggestionsProps) {
  const { user } = useAuth();
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);


  async function loadIcebreakers() {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/ai/icebreakers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderName: user.displayName || "User",
          receiverName,
          sharedInterests,
          compatibilityScore,
          receiverBio,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setIcebreakers(data.icebreakers);
      setShown(true);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }


  if (!shown) {
    return (
      <button
        onClick={loadIcebreakers}
        disabled={loading}
        className="text-sm text-[#f97316] font-medium hover:underline disabled:opacity-50"
      >
        {loading ? "Loading..." : "✨ Suggest conversation starters"}
      </button>
    );
  }


  return (
    <div className="bg-orange-50 rounded-xl p-3 space-y-2">
      <p className="text-xs text-gray-500 font-medium">AI Suggestions:</p>
      {icebreakers.map((msg, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(msg)}
          className="block w-full text-left text-sm p-2 bg-white rounded-lg hover:bg-orange-100 transition-colors"
        >
          {msg}
        </button>
      ))}
      <button onClick={() => setShown(false)} className="text-xs text-gray-400 hover:text-gray-600">
        Hide
      </button>
    </div>
  );
}

