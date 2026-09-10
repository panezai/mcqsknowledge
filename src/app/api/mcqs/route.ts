import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const random = searchParams.get('random') === 'true';
    const count = searchParams.get('count');

    // If just counting
    if (count === 'true') {
      const where: Prisma.McqWhereInput = {};
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

    const where: Prisma.McqWhereInput = {};
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
        select: { id: true }
      });

      // Shuffle and pick
      const shuffled = allMcqs.sort(() => Math.random() - 0.5);
      const selectedIds = shuffled.slice(0, randomLimit).map(m => m.id);

      const mcqs = await db.mcq.findMany({
        where: { id: { in: selectedIds } },
        include: { category: { select: { name: true, slug: true, icon: true } } },
        orderBy: Prisma.raw('RANDOM()')
      });

      // Don't send correct answers for quiz mode
      const safeMcqs = mcqs.map(({ correctAnswer, ...rest }) => ({
        ...rest,
        hasAnswer: !!correctAnswer
      }));

      return NextResponse.json({
        success: true,
        data: safeMcqs,
        total: selectedIds.length
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
      data: mcqs.map(mcq => ({
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
  } catch (error) {
    console.error('Error fetching MCQs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch MCQs' }, { status: 500 });
  }
}
