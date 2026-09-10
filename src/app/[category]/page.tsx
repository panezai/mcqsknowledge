import { Metadata } from 'next';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CategoryPageClient } from '@/components/CategoryPageClient';

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await db.category.findUnique({
    where: { slug: categorySlug },
    include: { _count: { select: { mcqs: true } } }
  });

  if (!category) {
    return { title: 'Category Not Found - MCQs Knowledge' };
  }

  const title = `${category.name} MCQs - MCQs Knowledge`;
  const description = `Prepare for ${category.name} MCQs. ${category.description || `Practice ${category._count.mcqs}+ ${category.name} multiple choice questions for NTS, FPSC, PPSC tests.`}`;

  return {
    title,
    description,
    keywords: [category.name, 'MCQs', 'NTS', 'FPSC', 'PPSC', 'Pakistan', 'Test Preparation', category.name + ' Questions'],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://mcqsworld.space-z.ai/${categorySlug}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://mcqsworld.space-z.ai/${categorySlug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const limit = 15;

  // Fetch category
  const category = await db.category.findUnique({
    where: { slug: categorySlug },
    include: { _count: { select: { mcqs: true } } }
  });

  if (!category) {
    notFound();
  }

  // Fetch MCQs with pagination
  const skip = (page - 1) * limit;
  const [mcqs, total] = await Promise.all([
    db.mcq.findMany({
      where: { categorySlug },
      include: { category: { select: { name: true, slug: true, icon: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.mcq.count({ where: { categorySlug } })
  ]);

  const totalPages = Math.ceil(total / limit);

  // Fetch all categories for sidebar
  const allCategories = await db.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { mcqs: true } } }
  });

  const mcqsData = mcqs.map(mcq => ({
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

  const categoriesData = allCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    order: cat.order,
    mcqCount: cat._count.mcqs
  }));

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} MCQs`,
    description: category.description || `Practice ${total}+ ${category.name} multiple choice questions`,
    url: `https://mcqsworld.space-z.ai/${categorySlug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'MCQs Knowledge',
      url: 'https://mcqsworld.space-z.ai',
    },
    about: {
      '@type': 'Thing',
      name: category.name,
    },
    hasPart: mcqs.slice(0, 5).map(mcq => ({
      '@type': 'Question',
      name: mcq.question,
      suggestedAnswer: [
        { '@type': 'Answer', text: mcq.optionA },
        { '@type': 'Answer', text: mcq.optionB },
        { '@type': 'Answer', text: mcq.optionC },
        { '@type': 'Answer', text: mcq.optionD },
      ],
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPageClient
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          mcqCount: category._count.mcqs,
        }}
        mcqs={mcqsData}
        categories={categoriesData}
        pagination={{ page, totalPages, total, limit }}
      />
    </>
  );
}
