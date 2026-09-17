import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mcqsknowledge.com';

  // 1. Core pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  // 2. Fetch all categories
  const categories = await db.category.findMany({
    orderBy: { order: 'asc' },
    select: { slug: true, updatedAt: true },
  });

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat: any) => ({
    url: `${baseUrl}/${cat.slug}`,
    lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 3. Fetch all MCQ question entries for individual SEO targeting
  const mcqs = await db.mcq.findMany({
    select: { id: true, categorySlug: true, updatedAt: true },
  });

  const mcqEntries: MetadataRoute.Sitemap = mcqs.map((mcq: any) => ({
    url: `${baseUrl}/${mcq.categorySlug}/${mcq.id}`,
    lastModified: mcq.updatedAt ? new Date(mcq.updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...categoryEntries, ...mcqEntries];
}
