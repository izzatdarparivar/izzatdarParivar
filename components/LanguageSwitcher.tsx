"use client";

import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState("EN");
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "EN", label: "English" },
    { code: "HI", label: "हिन्दी (Hindi)" },
    { code: "PB", label: "ਪੰਜਾਬੀ (Punjabi)" }
  ];

  return (
    <div className="relative inline-block text-left">
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 rounded-xl transition font-semibold text-sm h-auto shadow-sm"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span>{lang}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition text-sm font-semibold flex items-center justify-between text-gray-700"
            >
              <span>{l.label}</span>
              {lang === l.code && <Check className="w-4 h-4 text-[var(--primary)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
