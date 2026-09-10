'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { McqCard } from './McqCard';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function SearchResults() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchResults = useCallback(async (p: number) => {
    if (!searchQuery) return;
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
    } else {
      setLoading(false);
    }
  }, [searchQuery, fetchResults]);

  if (!searchQuery) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">Enter a search term</h3>
          <p className="text-sm text-gray-500 mt-1">Use the search bar above to find MCQs</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
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
                categoryIcon={mcq.categoryIcon}
                categorySlug={mcq.categorySlug}
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
                onClick={() => { const p = page - 1; setPage(p); fetchResults(p); }}
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
                onClick={() => { const p = page + 1; setPage(p); fetchResults(p); }}
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
