import { db } from '@/lib/db';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryPageClient } from '@/components/CategoryPageClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const categories = await db.category.findMany({ select: { slug: true } });
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.category.findUnique({
    where: { slug },
    include: { _count: { select: { mcqs: true } } },
  });

  if (!category) return { title: 'Category Not Found' };

  const displayName = category.name.replace(/_MCQs$/, '');
  return {
    title: `${category.name} - PakMCQs`,
    description: `Practice ${category._count.mcqs} ${displayName} MCQs. Prepare for NTS, FPSC, PPSC tests with our comprehensive collection of ${displayName} multiple choice questions.`,
    keywords: [displayName, 'MCQs', 'PakMCQs', 'NTS', 'FPSC', 'PPSC', category.name],
    openGraph: {
      title: `${category.name} - PakMCQs`,
      description: `${category._count.mcqs} ${displayName} MCQs for test preparation`,
      type: 'website',
      url: `https://mcqsworld.space-z.ai/${slug}`,
    },
    alternates: {
      canonical: `https://mcqsworld.space-z.ai/${slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1');

  const category = await db.category.findUnique({
    where: { slug },
    include: { _count: { select: { mcqs: true } } },
  });

  if (!category) notFound();

  const limit = 10;
  const skip = (page - 1) * limit;

  const [mcqs, totalMcqs, allCategories] = await Promise.all([
    db.mcq.findMany({
      where: { categorySlug: slug },
      include: { category: { select: { name: true, slug: true, icon: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.mcq.count({ where: { categorySlug: slug } }),
    db.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { mcqs: true } } },
    }),
  ]);

  const totalPages = Math.ceil(totalMcqs / limit);

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

  const allCategoriesData = allCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    order: cat.order,
    mcqCount: cat._count.mcqs,
  }));

  const categoryData = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    order: category.order,
    mcqCount: category._count.mcqs,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mcqsworld.space-z.ai' },
          { '@type': 'ListItem', position: 2, name: category.name, item: `https://mcqsworld.space-z.ai/${slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: mcqsData.slice(0, 5).map(mcq => ({
          '@type': 'Question',
          name: mcq.question,
          acceptedAnswer: mcq.correctAnswer ? {
            '@type': 'Answer',
            text: mcq.correctAnswer,
          } : undefined,
        })).filter(q => q.acceptedAnswer),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <CategoryPageClient
            category={categoryData}
            initialMcqs={mcqsData}
            initialPage={page}
            totalPages={totalPages}
            allCategories={allCategoriesData}
          />
        </main>
        <Footer />
      </div>
    </>
  );
}
