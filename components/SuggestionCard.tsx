"use client";

import { useState, useEffect } from "react";
import { X, Camera, FileText, Heart, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Suggestion } from "@/lib/suggestions";

const ICONS = {
  photo: Camera,
  bio: FileText,
  hobbies: Heart,
  family: Users,
  preferences: Settings,
};

interface SuggestionCardProps {
  suggestion: Suggestion;
  onDismiss?: (id: string) => void;
}

export default function SuggestionCard({ suggestion, onDismiss }: SuggestionCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const Icon = ICONS[suggestion.icon];

  useEffect(() => {
    try {
      const key = "dismissed_suggestions";
      const existing = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      if (existing.includes(suggestion.id)) {
        setDismissed(true);
      }
    } catch {}
  }, [suggestion.id]);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    onDismiss?.(suggestion.id);
    try {
      const key = "dismissed_suggestions";
      const existing = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      localStorage.setItem(key, JSON.stringify([...existing, suggestion.id]));
    } catch {}
  }

  return (
    <div className="relative flex items-start gap-3 p-4 rounded-2xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{suggestion.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{suggestion.body}</p>
        <Link
          href={suggestion.actionUrl}
          className="inline-block mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2"
        >
          {suggestion.action} →
        </Link>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss suggestion"
        className="flex-shrink-0 p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
