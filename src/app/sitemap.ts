import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mcqsworld.space-z.ai';

  // Get all categories
  const categories = await db.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { mcqs: true } } }
  });

  // Homepage
  const homeEntry: MetadataRoute.Sitemap = [{
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }];

  // Category pages
  const categoryEntries: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${baseUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...homeEntry, ...categoryEntries];
}
