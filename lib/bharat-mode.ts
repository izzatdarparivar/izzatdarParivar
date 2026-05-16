export interface ConnectionInfo {
  effectiveType: "slow-2g" | "2g" | "3g" | "4g";
  downlink: number;
  rtt: number;
  saveData: boolean;
}


export function getConnectionInfo(): ConnectionInfo {
  if (typeof navigator === "undefined" || !("connection" in navigator)) {
    return { effectiveType: "4g", downlink: 10, rtt: 50, saveData: false };
  }
  const conn = (navigator as any).connection;
  return {
    effectiveType: conn.effectiveType || "4g",
    downlink: conn.downlink || 10,
    rtt: conn.rtt || 50,
    saveData: conn.saveData || false,
  };
}


export function shouldUseBharatMode(): boolean {
  const info = getConnectionInfo();
  return (
    info.saveData ||
    info.effectiveType === "slow-2g" ||
    info.effectiveType === "2g" ||
    (info.effectiveType === "3g" && info.downlink < 1.5) ||
    info.rtt > 500
  );
}


export function getImageQuality(): "low" | "medium" | "high" {
  const info = getConnectionInfo();
  if (info.effectiveType === "slow-2g" || info.effectiveType === "2g") return "low";
  if (info.effectiveType === "3g") return "medium";
  return "high";
}


export function getImageSize(quality: "low" | "medium" | "high"): { width: number; height: number } {
  switch (quality) {
    case "low": return { width: 100, height: 100 };
    case "medium": return { width: 300, height: 300 };
    case "high": return { width: 600, height: 600 };
  }
}


export function getCloudinaryTransform(url: string, quality: "low" | "medium" | "high"): string {
  if (!url.includes("cloudinary.com")) return url;
  const size = getImageSize(quality);
  const q = quality === "low" ? 30 : quality === "medium" ? 60 : 80;
  return url.replace("/upload/", `/upload/w_${size.width},h_${size.height},q_${q},f_auto/`);
}


export interface BharatModeConfig {
  enabled: boolean;
  disableAnimations: boolean;
  lazyLoadImages: boolean;
  reducedData: boolean;
  textOnly: boolean;
  pageSize: number;
  imageQuality: "low" | "medium" | "high";
}


export function getBharatModeConfig(): BharatModeConfig {
  const isBharat = shouldUseBharatMode();
  const quality = getImageQuality();


  return {
    enabled: isBharat,
    disableAnimations: isBharat,
    lazyLoadImages: true,
    reducedData: isBharat,
    textOnly: quality === "low",
    pageSize: isBharat ? 5 : 20,
    imageQuality: quality,
  };
}


// Minimal data payload for slow connections
export interface MinimalProfile {
  uid: string;
  name: string;
  age: number;
  city: string;
  score: number;
}


export function toMinimalProfile(profile: any): MinimalProfile {
  return {
    uid: profile.uid || profile.id,
    name: profile.displayName || "",
    age: profile.age || 0,
    city: profile.location?.city || "",
    score: profile.score || 0,
  };
}

