'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, Menu, X, Play, BookOpen, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export function Header() {
  const { setView, sidebarOpen, setSidebarOpen, categories } = useAppStore();
  const [localSearch, setLocalSearch] = useState('');
  const router = useRouter();

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSidebarOpen(false);
      router.push(`/search?q=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-sm" suppressHydrationWarning>
      {/* Top Announcement Bar */}
      <div className="bg-[#007540] text-white text-[11px] sm:text-xs py-1.5 px-3 text-center font-medium" suppressHydrationWarning>
        <p className="truncate">Pakistan&apos;s Largest MCQs Website — NTS, FPSC, PPSC, BPSC, SPSC Tests</p>
      </div>

      {/* Main Header Container */}
      <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4" suppressHydrationWarning>
        {/* Mobile Hamburger Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0 h-9 w-9 text-gray-700 hover:text-[#007540] hover:bg-[#007540]/10"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#007540] to-[#005e33] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm" suppressHydrationWarning>
            <span>M</span>
          </div>
          <div suppressHydrationWarning>
            <h1 className="text-base sm:text-lg font-bold text-[#007540] leading-tight tracking-tight">MCQs Knowledge</h1>
            <p className="text-[10px] text-gray-500 leading-tight hidden xs:block">MCQs & Quiz Portal</p>
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-4">
          <div className="relative" suppressHydrationWarning>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search MCQs..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 pr-3 h-9 text-xs sm:text-sm bg-gray-50 border-gray-200 focus:border-[#007540] focus:ring-[#007540]/20 rounded-full"
            />
          </div>
        </form>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2 shrink-0" suppressHydrationWarning>
          <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:text-[#007540] hover:bg-[#007540]/10 font-medium">
            <Link href="/">
              <Home className="h-4 w-4 mr-1.5 text-[#007540]" />
              Home
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => setView('quiz-setup')}
            className="bg-[#007540] hover:bg-[#005e33] text-white font-medium shadow-sm"
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Take Quiz
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Slide-Over */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" suppressHydrationWarning>
          {/* Backdrop Mask */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
            suppressHydrationWarning
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-[82%] max-w-xs bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200" suppressHydrationWarning>
            {/* Drawer Header */}
            <div className="p-4 border-b bg-[#007540] text-white flex items-center justify-between" suppressHydrationWarning>
              <div className="flex items-center gap-2" suppressHydrationWarning>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-white" suppressHydrationWarning>
                  <span>M</span>
                </div>
                <div suppressHydrationWarning>
                  <h2 className="font-bold text-sm leading-tight">MCQs Knowledge</h2>
                  <p className="text-[10px] text-white/80">Navigation Menu</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick Actions & Nav */}
            <div className="p-3 border-b bg-gray-50/80 space-y-1.5" suppressHydrationWarning>
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-[#007540] hover:shadow-xs transition-all"
              >
                <Home className="h-4 w-4 text-[#007540]" />
                Home
              </Link>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  setView('quiz-setup');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#007540] bg-[#007540]/10 hover:bg-[#007540]/20 transition-all text-left"
              >
                <Play className="h-4 w-4" />
                Take Online Quiz
              </button>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1" suppressHydrationWarning>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5" suppressHydrationWarning>
                <BookOpen className="h-3.5 w-3.5" />
                All Subject Categories
              </div>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/${cat.slug}`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-[#007540]/5 hover:text-[#007540] transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate" suppressHydrationWarning>
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0 font-normal">
                      {cat.mcqCount}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-gray-400" suppressHydrationWarning>Loading categories...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
