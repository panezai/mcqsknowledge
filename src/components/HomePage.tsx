'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CategoryCard } from './CategoryCard';
import { McqCard } from './McqCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Play, TrendingUp, Zap, Search, ArrowRight } from 'lucide-react';

export function HomePage() {
  const { categories, setCategories, setView, setSelectedCategory } = useAppStore();
  const [recentMcqs, setRecentMcqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMcqs, setTotalMcqs] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, mcqRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/mcqs?limit=5&page=1')
        ]);

        const catData = await catRes.json();
        const mcqData = await mcqRes.json();

        if (catData.success) {
          setCategories(catData.data);
          const total = catData.data.reduce((sum: number, c: any) => sum + c.mcqCount, 0);
          setTotalMcqs(total);
        }
        if (mcqData.success) {
          setRecentMcqs(mcqData.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setCategories]);

  const popularCategories = categories
    .filter(c => c.mcqCount > 0)
    .sort((a, b) => b.mcqCount - a.mcqCount)
    .slice(0, 6);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#007540] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#007540] to-[#005e33] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTJ2NEgyNFYwSDEydjRIMHYyaDEyVjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTB2NEgwdjJoMTJ2LTRoMnYtMmgtMnYtMmgydi0yaC0ydi0yaDJ2LTJoLTJ2LTJoMnYtMmgtMnYtMmgyVi0yaC0yVi00aDJWLThoLTJ2LTJoMlYtOGgtMlYtOGgyVi04aC0yVi04aDJWOGgtMlY0aDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                PakMCQs
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
                onClick={() => setView('quiz-setup')}
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
              onClick={() => setView('quiz-setup')}
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
