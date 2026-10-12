import { db } from '@/lib/db';
import { SearchClient } from '@/components/SearchClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search MCQs - MCQs Knowledge',
  description: 'Search across thousands of MCQs on MCQs Knowledge. Find questions for NTS, FPSC, PPSC test preparation.',
  openGraph: {
    title: 'Search MCQs - MCQs Knowledge',
    description: 'Search across thousands of MCQs on MCQs Knowledge',
    type: 'website',
    url: 'https://www.mcqsknowledge.com/search',
  },
  alternates: {
    canonical: 'https://www.mcqsknowledge.com/search',
  },
};

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams?: Promise<{ q?: string; page?: string }> | { q?: string; page?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  let query = '';
  let page = 1;
  let initialResults: Array<{
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
  }> = [];
  let initialTotal = 0;
  let initialTotalPages = 0;

  try {
    const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
    query = (resolvedParams.q || '').trim();
    page = Math.max(1, parseInt(resolvedParams.page || '1') || 1);

    if (query) {
      const limit = 10;
      const skip = (page - 1) * limit;
      const where = {
        OR: [
          { question: { contains: query } },
          { optionA: { contains: query } },
          { optionB: { contains: query } },
          { optionC: { contains: query } },
          { optionD: { contains: query } },
        ],
      };

      const [mcqs, total] = await Promise.all([
        db.mcq.findMany({
          where,
          include: { category: { select: { name: true, slug: true, icon: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.mcq.count({ where }),
      ]);

      initialResults = (mcqs || []).map((mcq: any) => ({
        id: mcq.id,
        question: mcq.question,
        optionA: mcq.optionA,
        optionB: mcq.optionB,
        optionC: mcq.optionC,
        optionD: mcq.optionD,
        correctAnswer: mcq.correctAnswer || '',
        categorySlug: mcq.categorySlug || '',
        categoryName: mcq.category?.name || '',
        categoryIcon: mcq.category?.icon || '📚',
        submittedBy: mcq.submittedBy || '',
        hasAnswer: !!mcq.correctAnswer,
      }));

      initialTotal = total || 0;
      initialTotalPages = Math.ceil(initialTotal / limit) || 0;
    }
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('Dynamic server usage')) {
      throw error;
    }
    console.error('Error fetching search results:', error);
  }

  return (
    <SearchClient
      initialQuery={query}
      initialResults={initialResults}
      initialTotal={initialTotal}
      initialTotalPages={initialTotalPages}
      initialPage={page}
    />
  );
}
