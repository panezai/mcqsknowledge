'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryCard } from '@/components/CategoryCard';
import { McqCard } from '@/components/McqCard';
import { QuizDialog } from '@/components/QuizDialog';
import { Search, BookOpen, Brain, Trophy, ArrowRight, Zap } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  mcqCount: number;
}

interface McqItem {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  submittedBy?: string;
  hasAnswer: boolean;
}

interface HomeClientProps {
  categories: Category[];
  recentMcqs: McqItem[];
  totalMcqs: number;
  totalCategories: number;
}

export function HomeClient({ categories, recentMcqs, totalMcqs, totalCategories }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const featuredCategories = categories.slice(0, 8);
  const popularCategories = categories.filter(c => c.mcqCount > 50).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#007540] to-[#005e33] text-white p-8 sm:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Pakistan&apos;s Largest MCQs Website
          </h2>
          <p className="text-white/90 text-lg mb-6 max-w-2xl">
            Prepare for NTS, FPSC, PPSC, BPSC, SPSC tests with {totalMcqs.toLocaleString()}+ multiple choice questions across {totalCategories}+ subjects.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search MCQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/95 text-gray-900 border-0 focus:ring-2 focus:ring-white/50"
              />
            </div>
            <Button type="submit" className="bg-white text-[#007540] hover:bg-white/90 font-semibold">
              Search
            </Button>
          </form>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-white/80" />
              <span className="text-sm text-white/80">{totalCategories}+ Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-white/80" />
              <span className="text-sm text-white/80">{totalMcqs.toLocaleString()}+ MCQs</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-white/80" />
              <span className="text-sm text-white/80">Free Quizzes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories with Quiz */}
      {popularCategories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#007540]" />
              Popular Categories
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularCategories.map((cat) => (
              <Card key={cat.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900">{cat.name.replace(/_MCQs$/, '')}</h3>
                      <p className="text-xs text-gray-500">{cat.mcqCount} MCQs</p>
                    </div>
                  </div>
                  <QuizDialog
                    categorySlug={cat.slug}
                    categoryName={cat.name}
                    categoryIcon={cat.icon}
                  >
                    <Button size="sm" variant="outline" className="text-[#007540] border-[#007540]/30 hover:bg-[#007540]/10">
                      <Zap className="h-3.5 w-3.5 mr-1" /> Quiz
                    </Button>
                  </QuizDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Categories</h2>
          <Badge variant="secondary" className="bg-[#007540]/10 text-[#007540]">
            {categories.length} Categories
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {featuredCategories.map((cat) => (
            <CategoryCard key={cat.id} {...cat} />
          ))}
        </div>
        {categories.length > 8 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.slice(8).map((cat) => (
              <CategoryCard key={cat.id} {...cat} />
            ))}
          </div>
        )}
      </section>

      {/* Recent MCQs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent MCQs</h2>
          <Badge variant="secondary" className="bg-[#007540]/10 text-[#007540]">
            Latest Questions
          </Badge>
        </div>
        <div className="space-y-4">
          {recentMcqs.map((mcq, index) => (
            <McqCard
              key={mcq.id}
              {...mcq}
              index={index}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
