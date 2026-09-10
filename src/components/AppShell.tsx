'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { QuizOverlay } from './QuizOverlay';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
      <QuizOverlay />
    </div>
  );
}
