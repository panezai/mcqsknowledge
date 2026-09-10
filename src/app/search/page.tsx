import { db } from '@/lib/db';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchClient } from '@/components/SearchClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search MCQs - PakMCQs',
  description: 'Search across thousands of MCQs on PakMCQs. Find questions for NTS, FPSC, PPSC test preparation.',
  openGraph: {
    title: 'Search MCQs - PakMCQs',
    description: 'Search across thousands of MCQs on PakMCQs',
    type: 'website',
    url: 'https://mcqsworld.space-z.ai/search',
  },
  alternates: {
    canonical: 'https://mcqsworld.space-z.ai/search',
  },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageStr } = await searchParams;
  const query = q || '';
  const page = parseInt(pageStr || '1');

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

    initialResults = mcqs.map(mcq => ({
      id: mcq.id,
      question: mcq.question,
      optionA: mcq.optionA,
      optionB: mcq.optionB,
      optionC: mcq.optionC,
      optionD: mcq.optionD,
      correctAnswer: mcq.correctAnswer,
      categorySlug: mcq.categorySlug,
      categoryName: mcq.category.name,
      categoryIcon: mcq.category.icon,
      submittedBy: mcq.submittedBy,
      hasAnswer: !!mcq.correctAnswer,
    }));

    initialTotal = total;
    initialTotalPages = Math.ceil(total / limit);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <SearchClient
          initialQuery={query}
          initialResults={initialResults}
          initialTotal={initialTotal}
          initialTotalPages={initialTotalPages}
          initialPage={page}
        />
      </main>
      <Footer />
    </div>
  );
}
