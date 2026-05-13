import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Topbar from "./Topbar";
import { ChatWidget } from "@/app/ChatWidget";
import { LanguageProvider } from "@/lib/LanguageProvider";

const geistSans = localFont({
  src: "../public/fonts/Geist[wght].woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../public/fonts/GeistMono[wght].woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Polymarket Signals",
  description: "AI-powered prediction market signals and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning>
        <LanguageProvider>
          <Topbar />
          <div className="app-layout">
            {children}
          </div>
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
