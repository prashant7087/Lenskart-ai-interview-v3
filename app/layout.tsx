import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // 1. Import the font
import "./globals.css";

// 2. Configure it (weights: 300=Light, 400=Regular, 600=SemiBold, 700=Bold)
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "Lenskart AI Trainer",
  description: "AI-powered roleplay assessment tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Apply the font variable to the body */}
      <body className={poppins.className}>{children}</body>
    </html>
  );
}