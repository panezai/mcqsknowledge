import { Metadata } from 'next';
import { db } from '@/lib/db';
import { HomePageClient } from '@/components/HomePageClient';
import { SearchResults } from '@/components/SearchResults';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: "MCQs Knowledge - Pakistan's Largest MCQs Website | NTS, FPSC, PPSC Test Preparation",
  description: "MCQs Knowledge is Pakistan's largest MCQs website. Prepare for NTS, FPSC, PPSC, BPSC, SPSC tests with our comprehensive collection of multiple choice questions across 37+ subjects including General Knowledge, Islamic Studies, Pak Study, English, Mathematics, Computer Science and more.",
  keywords: ["MCQs Knowledge", "MCQs", "NTS", "FPSC", "PPSC", "Pakistan", "Quiz", "Test Preparation", "General Knowledge", "Islamic Studies", "Pak Study", "English MCQs", "Computer MCQs", "Mathematics MCQs"],
  openGraph: {
    title: "MCQs Knowledge - Pakistan's Largest MCQs Website",
    description: "Prepare for NTS, FPSC, PPSC tests with comprehensive MCQs across 37+ subjects",
    type: "website",
    url: "https://mcqsworld.space-z.ai",
  },
  twitter: {
    card: "summary",
    title: "MCQs Knowledge - Pakistan's Largest MCQs Website",
    description: "Prepare for NTS, FPSC, PPSC tests with comprehensive MCQs",
  },
  alternates: {
    canonical: "https://mcqsworld.space-z.ai",
  },
};

export default async function Home() {
  // Fetch data server-side
  const [categories, recentMcqs] = await Promise.all([
    db.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { mcqs: true } } }
    }),
    db.mcq.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true, slug: true, icon: true } } }
    })
  ]);

  const categoriesData = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    order: cat.order,
    mcqCount: cat._count.mcqs
  }));

  const totalMcqs = categories.reduce((sum, c) => sum + c._count.mcqs, 0);

  const recentMcqsData = recentMcqs.map(mcq => ({
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

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MCQs Knowledge',
    url: 'https://mcqsworld.space-z.ai',
    description: "Pakistan's Largest MCQs Website",
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://mcqsworld.space-z.ai/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <HomeContent
          categories={categoriesData}
          recentMcqs={recentMcqsData}
          totalMcqs={totalMcqs}
        />
      </Suspense>
    </>
  );
}

import { HomePageContent } from '@/components/HomePageContent';

function HomeContent({ categories, recentMcqs, totalMcqs }: {
  categories: any[];
  recentMcqs: any[];
  totalMcqs: number;
}) {
  return (
    <HomePageContent categories={categories} recentMcqs={recentMcqs} totalMcqs={totalMcqs} />
  );
}
