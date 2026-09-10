'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export function Header() {
  const { setView, sidebarOpen, setSidebarOpen } = useAppStore();
  const [localSearch, setLocalSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/?q=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-[#007540] text-white text-xs py-1.5 px-4 text-center">
        <p>Pakistan&apos;s Largest MCQs Website — Prepare for NTS, FPSC, PPSC, BPSC, SPSC Tests</p>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 bg-[#007540] rounded-lg flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-[#007540] leading-tight">MCQs Knowledge</h1>
            <p className="text-[10px] text-gray-500 leading-tight">MCQs & Quiz Portal</p>
          </div>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search MCQs..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 pr-4 h-9 bg-gray-50 border-gray-200 focus:border-[#007540] focus:ring-[#007540]/20"
            />
          </div>
        </form>

        {/* Nav buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-[#007540] hover:text-[#005e33] hover:bg-[#007540]/10">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('quiz-setup')}
            className="text-[#007540] hover:text-[#005e33] hover:bg-[#007540]/10"
          >
            Take Quiz
          </Button>
        </div>
      </div>
    </header>
  );
}
