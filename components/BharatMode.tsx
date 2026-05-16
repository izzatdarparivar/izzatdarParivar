"use client";


import { useState, useEffect, createContext, useContext } from "react";
import { getBharatModeConfig, BharatModeConfig } from "@/lib/bharat-mode";


const BharatModeContext = createContext<BharatModeConfig>({
  enabled: false,
  disableAnimations: false,
  lazyLoadImages: true,
  reducedData: false,
  textOnly: false,
  pageSize: 20,
  imageQuality: "high",
});


export function useBharatMode() {
  return useContext(BharatModeContext);
}


export function BharatModeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<BharatModeConfig>(getBharatModeConfig());


  useEffect(() => {
    // Re-check on connection change
    if ("connection" in navigator) {
      const conn = (navigator as any).connection;
      const handleChange = () => setConfig(getBharatModeConfig());
      conn.addEventListener("change", handleChange);
      return () => conn.removeEventListener("change", handleChange);
    }
  }, []);


  return (
    <BharatModeContext.Provider value={config}>
      {config.enabled && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-xs text-center py-1 z-50">
          Bharat Mode: Optimized for slow connections
        </div>
      )}
      <div className={config.disableAnimations ? "[&_*]:!transition-none [&_*]:!animation-none" : ""}>
        {children}
      </div>
    </BharatModeContext.Provider>
  );
}


// Optimized image component for Bharat Mode
export function BharatImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const { imageQuality, textOnly } = useBharatMode();


  if (textOnly) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center text-gray-500 text-xs ${className || ""}`}>
        {alt[0] || "?"}
      </div>
    );
  }


  const optimizedSrc = src.includes("cloudinary.com")
    ? src.replace("/upload/", `/upload/w_${imageQuality === "low" ? 100 : 300},q_${imageQuality === "low" ? 30 : 60},f_auto/`)
    : src;


  return <img src={optimizedSrc} alt={alt} className={className} loading="lazy" />;
}

