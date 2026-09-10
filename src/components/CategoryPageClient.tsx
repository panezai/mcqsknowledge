'use client';

import { useState } from 'react';
import Link from 'next/link';
import { McqCard } from './McqCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Play, Sparkles, Home, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
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

interface CategoryPageClientProps {
  category: Category;
  mcqs: McqItem[];
  categories: Category[];
  pagination: { page: number; totalPages: number; total: number; limit: number };
}

export function CategoryPageClient({ category, mcqs, categories, pagination }: CategoryPageClientProps) {
  const { setView, setQuizCategory, setCategories } = useAppStore();
  const [generating, setGenerating] = useState(false);

  const handleStartQuiz = () => {
    setCategories(categories);
    setQuizCategory(category);
    setView('quiz-setup');
  };

  const handleGenerateAnswers = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/answers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5 })
      });
      const data = await res.json();
      if (data.success) {
        // Reload the page to show updated answers
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to generate answers:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[#007540] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">{category.name} MCQs</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">{category.icon}</span>
              {category.name} MCQs
            </h1>
            {category.description && (
              <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
            )}
            <Badge variant="secondary" className="mt-1.5 bg-[#007540]/10 text-[#007540]">
              {pagination.total} MCQs
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAnswers}
              disabled={generating}
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {generating ? 'Generating...' : 'AI Answers'}
            </Button>
            <Button
              size="sm"
              onClick={handleStartQuiz}
              className="bg-[#007540] hover:bg-[#005e33]"
            >
              <Play className="w-3.5 h-3.5 mr-1" /> Take Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* MCQs list */}
      {mcqs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg font-medium text-gray-700">No MCQs found</p>
            <p className="text-sm text-gray-500 mt-1">This category doesn&apos;t have any MCQs yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {mcqs.map((mcq, idx) => (
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
                index={(pagination.page - 1) * pagination.limit + idx}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              {pagination.page > 1 ? (
                <Link href={`/${category.slug}?page=${pagination.page - 1}`}>
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
              )}
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              {pagination.page < pagination.totalPages ? (
                <Link href={`/${category.slug}?page=${pagination.page + 1}`}>
                  <Button variant="outline" size="sm">
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Related Categories */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Other Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories
            .filter(c => c.slug !== category.slug && c.mcqCount > 0)
            .slice(0, 12)
            .map(cat => (
              <Link key={cat.slug} href={`/${cat.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-[#007540]/10 hover:border-[#007540]/30 hover:text-[#007540] transition-colors py-1.5 px-3"
                >
                  {cat.icon} {cat.name} ({cat.mcqCount})
                </Badge>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
