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
  metadataBase: new URL("https://www.mcqsknowledge.com"),
  title: "MCQs Knowledge - Pakistan's Largest MCQs Website",
  description: "MCQs Knowledge is Pakistan's largest MCQs website. Prepare for NTS, FPSC, PPSC, BPSC, SPSC tests with our comprehensive collection of multiple choice questions across 37+ subjects.",
  keywords: ["MCQs Knowledge", "MCQs", "NTS", "FPSC", "PPSC", "Pakistan", "Quiz", "Test Preparation", "General Knowledge", "Islamic Studies", "Pak Study"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "MCQs Knowledge - Pakistan's Largest MCQs Website",
    description: "Prepare for NTS, FPSC, PPSC tests with comprehensive MCQs",
    url: "https://www.mcqsknowledge.com",
    siteName: "MCQs Knowledge",
    type: "website",
  },
  alternates: {
    canonical: "https://www.mcqsknowledge.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8067692542722306"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        suppressHydrationWarning
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
