import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NWTT Live CAD — Miami-Dade Fire",
  description: "Real-time CAD incident map for Miami-Dade Fire Rescue",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full dark`}>
      <body className="h-full bg-[#0d0d1a] text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
