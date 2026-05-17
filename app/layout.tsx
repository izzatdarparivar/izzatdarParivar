import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/next";


const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});


export const metadata: Metadata = {
  title: "Izzatdar Parivar — Premium Matrimonial Service",
  description:
    "Find your life partner through India's most trusted and premium matrimonial platform. Verified profiles, curated matches, and a heritage-inspired experience.",
  keywords: ["matrimony", "marriage", "Indian matrimonial", "rishta", "shaadi"],
  openGraph: {
    title: "Izzatdar Parivar — Premium Matrimonial Service",
    description: "Find your life partner through India's most trusted matrimonial platform.",
    type: "website",
  },
};




import { BharatModeProvider } from "@/context/BharatModeContext";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased">
        <BharatModeProvider>
          <AuthProvider>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)]"><div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" /></div>}>
              {children}
            </Suspense>
            <Toaster richColors position="top-right" />
            <SpeedInsights />
          </AuthProvider>
        </BharatModeProvider>
      </body>
    </html>
  );
}



