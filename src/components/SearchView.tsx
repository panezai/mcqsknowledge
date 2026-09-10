'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { McqCard } from './McqCard';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function SearchView() {
  const { searchQuery, setView, goHome } = useAppStore();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchResults = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mcqs?search=${encodeURIComponent(searchQuery)}&page=${p}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      fetchResults(1);
    }
  }, [searchQuery, fetchResults]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={goHome} className="text-gray-500 mb-2">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </Button>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-[#007540]" />
          Search Results for &ldquo;{searchQuery}&rdquo;
        </h2>
        <p className="text-sm text-gray-500 mt-1">{total} MCQs found</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#007540] animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700">No results found</h3>
            <p className="text-sm text-gray-500 mt-1">Try searching with different keywords</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {results.map((mcq, idx) => (
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
                submittedBy={mcq.submittedBy}
                hasAnswer={mcq.hasAnswer}
                index={idx}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => { setPage(p => p - 1); fetchResults(page - 1); }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="flex items-center text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => { setPage(p => p + 1); fetchResults(page + 1); }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
