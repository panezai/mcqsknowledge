'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { McqCard } from '@/components/McqCard';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface SearchClientProps {
  initialQuery: string;
  initialResults: McqItem[];
  initialTotal: number;
  initialTotalPages: number;
  initialPage: number;
}

export function SearchClient({
  initialQuery,
  initialResults,
  initialTotal,
  initialTotalPages,
  initialPage,
}: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<McqItem[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [searched, setSearched] = useState(!!initialQuery);

  const doSearch = useCallback((q: string, p: number) => {
    if (!q.trim()) return;
    setLoading(true);
    fetch(`/api/mcqs?search=${encodeURIComponent(q.trim())}&page=${p}&limit=10`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResults(data.data);
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
          setSearched(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    doSearch(query, 1);
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
    doSearch(query, newPage);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-[#007540] to-[#005e33] rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-3">Search MCQs</h1>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search questions, options..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-white/95 text-gray-900 border-0 focus:ring-2 focus:ring-white/50"
            />
          </div>
          <Button type="submit" className="bg-white text-[#007540] hover:bg-white/90 font-semibold">
            Search
          </Button>
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#007540] animate-spin" />
        </div>
      )}

      {!loading && searched && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {total > 0
                ? `Found ${total} result${total !== 1 ? 's' : ''} for "${query}"`
                : `No results found for "${query}"`}
            </p>
            {total > 0 && (
              <Badge variant="secondary" className="bg-[#007540]/10 text-[#007540]">
                Page {page} of {totalPages}
              </Badge>
            )}
          </div>

          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((mcq, index) => (
                <McqCard
                  key={mcq.id}
                  {...mcq}
                  index={(page - 1) * 10 + index}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700">No results found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Try different keywords or browse categories
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {!searched && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700">Search for MCQs</h3>
            <p className="text-sm text-gray-500 mt-1">
              Enter keywords to search across all questions and options
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
