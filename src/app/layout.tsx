import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCQs Knowledge - Pakistan's Largest MCQs Website",
  description: "MCQs Knowledge is Pakistan's largest MCQs website. Prepare for NTS, FPSC, PPSC, BPSC, SPSC tests with our comprehensive collection of multiple choice questions across 37+ subjects.",
  keywords: ["MCQs Knowledge", "MCQs", "NTS", "FPSC", "PPSC", "Pakistan", "Quiz", "Test Preparation", "General Knowledge", "Islamic Studies", "Pak Study"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "MCQs Knowledge - Pakistan's Largest MCQs Website",
    description: "Prepare for NTS, FPSC, PPSC tests with comprehensive MCQs",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f9fafc] text-foreground`}
      >
        <AppShell>
          {children}
        </AppShell>
        <Toaster />
      </body>
    </html>
  );
}
