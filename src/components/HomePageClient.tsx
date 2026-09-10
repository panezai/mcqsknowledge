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
  const { setView, setCategories, setQuizCategory } = useAppStore();

  const handleStartQuiz = () => {
    setCategories(categories);
    setView('quiz-setup');
  };

  const popularCategories = categories
    .filter(c => c.mcqCount > 0)
    .sort((a, b) => b.mcqCount - a.mcqCount)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#007540] to-[#005e33] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTJ2NEgyNFYwSDEydjRIMHYyaDEyVjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTJ2LTRoMnYtMmgtMnYtMmgydi0yaC0ydi0yaDJ2LTJoLTJ2LTJoMnYtMmgtMnYtMmgyVi0yaC0yVi00aDJWLThoLTJ2LTJoMlYtOGgtMlYtOGgyVi04aC0yVi04aDJWOGgtMlY0aDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                MCQs Knowledge
              </h1>
              <p className="text-white/80 text-sm sm:text-base mb-4">
                Pakistan&apos;s Largest MCQs Website — Prepare for NTS, FPSC, PPSC, BPSC, SPSC Tests
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">
                  <BookOpen className="w-3.5 h-3.5 mr-1" />
                  {totalMcqs}+ MCQs
                </Badge>
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  {categories.length} Categories
                </Badge>
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleStartQuiz}
                className="bg-white text-[#007540] hover:bg-white/90 font-medium"
              >
                <Play className="w-4 h-4 mr-2" /> Take Quiz
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      {popularCategories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#007540]" />
              Popular Categories
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#007540]"
              onClick={() => {
                const el = document.getElementById('all-categories');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularCategories.map((cat) => (
              <CategoryCard key={cat.slug} {...cat} />
            ))}
          </div>
        </section>
      )}

      {/* All Categories */}
      <section id="all-categories">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#007540]" />
          All Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.slug} {...cat} />
          ))}
        </div>
      </section>

      {/* Recent MCQs */}
      {recentMcqs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#007540]" />
            Recent MCQs
          </h2>
          <div className="space-y-3">
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
        <Card className="bg-gradient-to-r from-[#007540]/5 to-[#007540]/10 border-[#007540]/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Test Your Knowledge?</h3>
            <p className="text-sm text-gray-600 mb-4">Take a quiz on any subject and see how well you score!</p>
            <Button
              onClick={handleStartQuiz}
              className="bg-[#007540] hover:bg-[#005e33]"
            >
              <Play className="w-4 h-4 mr-2" /> Start a Quiz Now
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
