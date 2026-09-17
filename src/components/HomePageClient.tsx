'use client';

import Link from 'next/link';
import { CategoryCard } from './CategoryCard';
import { McqCard } from './McqCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

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
  correctAnswer: string;
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  submittedBy: string;
  hasAnswer: boolean;
}

interface HomePageClientProps {
  categories: Category[];
  recentMcqs: McqItem[];
  totalMcqs: number;
}

export function HomePageClient({ categories, recentMcqs, totalMcqs }: HomePageClientProps) {
  const { setView, setCategories } = useAppStore();

  const handleStartQuiz = () => {
    setCategories(categories);
    setView('quiz-setup');
  };

  const popularCategories = categories
    .filter(c => c.mcqCount > 0)
    .sort((a, b) => b.mcqCount - a.mcqCount)
    .slice(0, 6);

  return (
    <div className="space-y-6 sm:space-y-8" suppressHydrationWarning>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#007540] to-[#005e33] rounded-2xl p-4 sm:p-8 text-white relative overflow-hidden shadow-md" suppressHydrationWarning>
        <div className="relative z-10 space-y-4" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" suppressHydrationWarning>
            <div className="space-y-2" suppressHydrationWarning>
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
                MCQs Knowledge
              </h1>
              <p className="text-white/90 text-xs sm:text-base max-w-xl leading-relaxed">
                Pakistan&apos;s Largest MCQs Website — Prepare for NTS, FPSC, PPSC, BPSC, SPSC Tests with 16,000+ MCQs
              </p>
              <div className="flex flex-wrap gap-2 pt-1" suppressHydrationWarning>
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 text-xs py-1 px-2.5">
                  <BookOpen className="w-3.5 h-3.5 mr-1" />
                  {totalMcqs.toLocaleString('en-US')}+ MCQs
                </Badge>
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 text-xs py-1 px-2.5">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  {categories.length} Categories
                </Badge>
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 text-xs py-1 px-2.5">
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  AI Answers
                </Badge>
              </div>
            </div>

            <Button
              onClick={handleStartQuiz}
              className="w-full sm:w-auto bg-white text-[#007540] hover:bg-white/90 font-bold shadow-md shrink-0 py-2.5 h-auto text-sm"
            >
              <Play className="w-4 h-4 mr-2 fill-[#007540]" /> Start Practice Quiz
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      {popularCategories.length > 0 && (
        <section suppressHydrationWarning>
          <div className="flex items-center justify-between mb-3" suppressHydrationWarning>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#007540]" />
              Popular Categories
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs sm:text-sm text-[#007540] p-0 h-auto hover:bg-transparent hover:underline"
              onClick={() => {
                const el = document.getElementById('all-categories');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3" suppressHydrationWarning>
            {popularCategories.map((cat) => (
              <CategoryCard key={cat.slug} {...cat} />
            ))}
          </div>
        </section>
      )}

      {/* All Categories */}
      <section id="all-categories" suppressHydrationWarning>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#007540]" />
          All Subject Categories ({categories.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3" suppressHydrationWarning>
          {categories.map((cat) => (
            <CategoryCard key={cat.slug} {...cat} />
          ))}
        </div>
      </section>

      {/* Recent MCQs */}
      {recentMcqs.length > 0 && (
        <section suppressHydrationWarning>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#007540]" />
            Recent Practice MCQs
          </h2>
          <div className="space-y-3" suppressHydrationWarning>
            {recentMcqs.map((mcq, idx) => (
              <McqCard
                key={mcq.id}
                id={mcq.id}
                question={mcq.question}
                optionA={mcq.optionA}
                optionB={mcq.optionB}
                optionC={mcq.optionC}
                optionD={mcq.optionD}
                correctAnswer={mcq.correctAnswer}
                categoryName={mcq.categoryName}
                categoryIcon={mcq.categoryIcon}
                categorySlug={mcq.categorySlug}
                submittedBy={mcq.submittedBy}
                hasAnswer={mcq.hasAnswer}
                index={idx}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section>
        <Card className="bg-gradient-to-r from-[#007540]/5 via-[#007540]/10 to-[#007540]/5 border-[#007540]/20 rounded-xl">
          <CardContent className="p-5 sm:p-6 text-center space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Ready to Test Your Knowledge?</h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Take an interactive quiz on any of our 37 subjects with instant scoring and detailed answers!
            </p>
            <Button
              onClick={handleStartQuiz}
              className="bg-[#007540] hover:bg-[#005e33] text-white font-bold text-xs sm:text-sm px-5 py-2.5 h-auto rounded-lg shadow-sm"
            >
              <Play className="w-4 h-4 mr-2 fill-white" /> Start a Quiz Now
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
