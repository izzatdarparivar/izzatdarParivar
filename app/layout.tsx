import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
