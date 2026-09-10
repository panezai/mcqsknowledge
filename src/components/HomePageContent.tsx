'use client';

import { useSearchParams } from 'next/navigation';
import { HomePageClient } from './HomePageClient';
import { SearchResults } from './SearchResults';

export function HomePageContent({ categories, recentMcqs, totalMcqs }: {
  categories: any[];
  recentMcqs: any[];
  totalMcqs: number;
}) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');

  if (searchQuery) {
    return <SearchResults />;
  }

  return (
    <HomePageClient
      categories={categories}
      recentMcqs={recentMcqs}
      totalMcqs={totalMcqs}
    />
  );
}
