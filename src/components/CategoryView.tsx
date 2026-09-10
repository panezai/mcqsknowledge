'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { McqCard } from './McqCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';

export function CategoryView() {
  const { selectedCategory, setView, goHome } = useAppStore();
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [generating, setGenerating] = useState(false);

  const fetchMcqs = useCallback(async (p: number) => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/mcqs?category=${selectedCategory.slug}&page=${p}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setMcqs(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch MCQs:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchMcqs(1);
    setPage(1);
  }, [fetchMcqs]);

  const handleGenerateAnswers = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/answers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 20 })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh the MCQs
        fetchMcqs(page);
      }
    } catch (error) {
      console.error('Failed to generate answers:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (!selectedCategory) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={goHome} className="text-gray-500 mb-2">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </Button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">{selectedCategory.icon}</span>
              {selectedCategory.name} MCQs
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{selectedCategory.description}</p>
            <Badge variant="secondary" className="mt-1.5 bg-[#007540]/10 text-[#007540]">
              {total} MCQs
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
              onClick={() => setView('quiz-setup')}
              className="bg-[#007540] hover:bg-[#005e33]"
            >
              <Play className="w-3.5 h-3.5 mr-1" /> Take Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* MCQs list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#007540] animate-spin" />
        </div>
      ) : mcqs.length === 0 ? (
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
                submittedBy={mcq.submittedBy}
                hasAnswer={mcq.hasAnswer}
                index={idx}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => { const p = page - 1; setPage(p); fetchMcqs(p); }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => { const p = page + 1; setPage(p); fetchMcqs(p); }}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
