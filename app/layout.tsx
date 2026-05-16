import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";


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




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}



