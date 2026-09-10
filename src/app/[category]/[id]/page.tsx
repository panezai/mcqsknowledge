import { db } from '@/lib/db';
import { McqDetailClient } from '@/components/McqDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface McqDetailPageProps {
  params: Promise<{ category: string; id: string }>;
}

export async function generateMetadata({ params }: McqDetailPageProps): Promise<Metadata> {
  const { category: categorySlug, id } = await params;
  const mcq = await db.mcq.findUnique({
    where: { id },
    include: { category: { select: { name: true, slug: true, icon: true } } },
  });

  if (!mcq) return { title: 'MCQ Not Found - MCQs Knowledge' };

  const displayName = mcq.category.name.replace(/_MCQs$/, '');
  return {
    title: `${mcq.question.substring(0, 60)}... - ${displayName} MCQs - MCQs Knowledge`,
    description: `Practice this ${displayName} MCQ: ${mcq.question.substring(0, 150)}`,
    openGraph: {
      title: `${displayName} MCQ - MCQs Knowledge`,
      description: mcq.question.substring(0, 200),
      type: 'website',
      url: `https://mcqsworld.space-z.ai/${categorySlug}/${id}`,
    },
    alternates: {
      canonical: `https://mcqsworld.space-z.ai/${categorySlug}/${id}`,
    },
  };
}

export default async function McqDetailPage({ params }: McqDetailPageProps) {
  const { category: categorySlug, id } = await params;

  const mcq = await db.mcq.findUnique({
    where: { id },
    include: { category: { select: { name: true, slug: true, icon: true } } },
  });

  if (!mcq || mcq.categorySlug !== categorySlug) notFound();

  // Get prev/next MCQs in the same category
  const [prevMcqs, nextMcqs] = await Promise.all([
    db.mcq.findMany({
      where: { categorySlug, createdAt: { lt: mcq.createdAt } },
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: { id: true, question: true, categorySlug: true },
    }),
    db.mcq.findMany({
      where: { categorySlug, createdAt: { gt: mcq.createdAt } },
      orderBy: { createdAt: 'asc' },
      take: 1,
      select: { id: true, question: true, categorySlug: true },
    }),
  ]);

  const prevMcq = prevMcqs[0] ? {
    id: prevMcqs[0].id,
    question: prevMcqs[0].question,
    categorySlug: prevMcqs[0].categorySlug,
    categoryName: mcq.category.name,
    hasAnswer: true,
  } : null;
  const nextMcq = nextMcqs[0] ? {
    id: nextMcqs[0].id,
    question: nextMcqs[0].question,
    categorySlug: nextMcqs[0].categorySlug,
    categoryName: mcq.category.name,
    hasAnswer: true,
  } : null;

  // Get related MCQs
  const relatedMcqsRaw = await db.mcq.findMany({
    where: { categorySlug, id: { not: id } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { category: { select: { name: true, slug: true } } },
  });

  const relatedMcqs = relatedMcqsRaw.map(m => ({
    id: m.id,
    question: m.question,
    categorySlug: m.categorySlug,
    categoryName: m.category.name,
    hasAnswer: !!m.correctAnswer,
  }));

  const mcqData = {
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
    sourceUrl: mcq.sourceUrl,
    difficulty: mcq.difficulty,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mcqsworld.space-z.ai' },
          { '@type': 'ListItem', position: 2, name: mcq.category.name, item: `https://mcqsworld.space-z.ai/${categorySlug}` },
          { '@type': 'ListItem', position: 3, name: 'Question', item: `https://mcqsworld.space-z.ai/${categorySlug}/${id}` },
        ],
      },
      {
        '@type': 'Question',
        name: mcq.question,
        suggestedAnswer: [
          { '@type': 'Answer', text: mcq.optionA },
          { '@type': 'Answer', text: mcq.optionB },
          { '@type': 'Answer', text: mcq.optionC },
          { '@type': 'Answer', text: mcq.optionD },
        ],
        ...(mcq.correctAnswer ? {
          acceptedAnswer: {
            '@type': 'Answer',
            text: mcq.correctAnswer,
          },
        } : {}),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <McqDetailClient
        mcq={mcqData}
        prevMcq={prevMcq}
        nextMcq={nextMcq}
        relatedMcqs={relatedMcqs}
      />
    </>
  );
}
