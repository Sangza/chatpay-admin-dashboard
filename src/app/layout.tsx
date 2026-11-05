import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatPay Admin",
  description: "ChatPay internal admin dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      {/* suppressHydrationWarning: a browser extension injects a
          __processed_<uuid>__ attribute onto <body> before React hydrates -
          this isn't our markup mismatching, it's the extension racing React,
          so silence just this one known, harmless warning. */}
      <body className="min-h-full flex flex-col bg-neutral-950" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
