import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CursorOrb } from "@/components/CursorOrb";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "OmniChat AI — The Cognitive Commerce Layer",
  description: "Autonomous AI that bridges intention and transaction. Deploy in minutes, scale without limits.",
  openGraph: {
    title: "OmniChat AI — The Cognitive Commerce Layer",
    description: "Autonomous AI that bridges intention and transaction.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-base text-primary font-sans antialiased overflow-x-hidden">
        {/* Scroll progress bar */}
        <div id="scroll-progress" aria-hidden="true" />

        {/* Cursor following orb */}
        <CursorOrb />

        {/* Noise texture overlay */}
        <div className="noise-overlay" aria-hidden="true" />

        {children}
      </body>
    </html>
  );
}
