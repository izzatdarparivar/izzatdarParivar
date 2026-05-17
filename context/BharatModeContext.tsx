"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface BharatModeContextType {
  isBharatMode: boolean;
  toggleBharatMode: () => void;
  translate: (key: string, defaultText: string) => string;
}

const BharatModeContext = createContext<BharatModeContextType | undefined>(undefined);

const translations: Record<string, Record<string, string>> = {
  HI: {
    dashboard: "डैशबोर्ड",
    matches: "योग्य रिश्ते",
    trustScore: "भरोसा स्कोर",
    premium: "प्रीमियम सदस्यता",
    biodata: "बायोडाटा",
    settings: "सेटिंग्स",
    chats: "बातचीत",
    phone: "फ़ोन नंबर",
    familyJoint: "संयुक्त परिवार (Joint Family)",
    familyNuclear: "एकल परिवार (Nuclear Family)"
  }
};

export function BharatModeProvider({ children }: { children: ReactNode }) {
  const [isBharatMode, setIsBharatMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bharatMode");
    if (saved === "true") setIsBharatMode(true);
  }, []);

  const toggleBharatMode = () => {
    const newVal = !isBharatMode;
    setIsBharatMode(newVal);
    localStorage.setItem("bharatMode", String(newVal));
  };

  const translate = (key: string, defaultText: string) => {
    if (!isBharatMode) return defaultText;
    return translations["HI"]?.[key] || defaultText;
  };

  return (
    <BharatModeContext.Provider value={{ isBharatMode, toggleBharatMode, translate }}>
      {children}
    </BharatModeContext.Provider>
  );
}

export function useBharatMode() {
  const context = useContext(BharatModeContext);
  if (!context) {
    throw new Error("useBharatMode must be used within a BharatModeProvider");
  }
  return context;
}
