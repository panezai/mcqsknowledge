import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scrapePakMcqsSearch, scrapePakMcqsCategory } from '@/lib/scraper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const random = searchParams.get('random') === 'true';
    const count = searchParams.get('count');

    // Trigger live scraping if searching or requesting a specific category
    if (search && search.trim().length > 0) {
      try {
        const scrapedMcqs = await scrapePakMcqsSearch(search, 15);
        if (scrapedMcqs && scrapedMcqs.length > 0) {
          for (const item of scrapedMcqs) {
            await db.mcq.create({ data: item });
          }
        }
      } catch (scrapeErr) {
        console.warn('Live search scraping warning:', scrapeErr);
      }
    } else if (category && category.trim().length > 0) {
      try {
        const scrapedCategoryMcqs = await scrapePakMcqsCategory(category, 15);
        if (scrapedCategoryMcqs && scrapedCategoryMcqs.length > 0) {
          for (const item of scrapedCategoryMcqs) {
            await db.mcq.create({ data: item });
          }
        }
      } catch (scrapeErr) {
        console.warn('Live category scraping warning:', scrapeErr);
      }
    }

    // If just counting
    if (count === 'true') {
      const where: any = {};
      if (category) where.categorySlug = category;
      if (search) {
        where.OR = [
          { question: { contains: search } },
          { optionA: { contains: search } },
          { optionB: { contains: search } },
          { optionC: { contains: search } },
          { optionD: { contains: search } },
        ];
      }
      const total = await db.mcq.count({ where });
      return NextResponse.json({ success: true, total });
    }

    const where: any = {};
    if (category) where.categorySlug = category;
    if (search) {
      where.OR = [
        { question: { contains: search } },
        { optionA: { contains: search } },
        { optionB: { contains: search } },
        { optionC: { contains: search } },
        { optionD: { contains: search } },
      ];
    }

    // Random selection for quiz
    if (random) {
      const randomLimit = limit > 50 ? 50 : limit;
      const allMcqs = await db.mcq.findMany({
        where,
      });

      // Shuffle and pick
      const shuffled = [...allMcqs].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, randomLimit);

      // Don't send correct answers for quiz mode
      const safeMcqs = selected.map(({ correctAnswer, ...rest }: any) => ({
        ...rest,
        categoryName: rest.category?.name || '',
        categoryIcon: rest.category?.icon || '📚',
        hasAnswer: !!correctAnswer
      }));

      return NextResponse.json({
        success: true,
        data: safeMcqs,
        total: safeMcqs.length
      });
    }

    const skip = (page - 1) * limit;
    const [mcqs, total] = await Promise.all([
      db.mcq.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true, icon: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.mcq.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: mcqs.map((mcq: any) => ({
        id: mcq.id,
        question: mcq.question,
        optionA: mcq.optionA,
        optionB: mcq.optionB,
        optionC: mcq.optionC,
        optionD: mcq.optionD,
        correctAnswer: mcq.correctAnswer,
        categorySlug: mcq.categorySlug,
        categoryName: mcq.category?.name || '',
        categoryIcon: mcq.category?.icon || '📚',
        submittedBy: mcq.submittedBy,
        createdAt: mcq.createdAt,
        hasAnswer: !!mcq.correctAnswer
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching MCQs:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch MCQs',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
