import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categorySlug, count = 10 } = body;

    if (!categorySlug) {
      return NextResponse.json({ success: false, error: 'Category slug is required' }, { status: 400 });
    }

    const questionCount = Math.min(Math.max(count, 1), 50);

    // First try to get MCQs that have correct answers
    let where: Prisma.McqWhereInput = { 
      categorySlug,
      correctAnswer: { not: '' }
    };

    let allMcqs = await db.mcq.findMany({
      where,
      select: { id: true }
    });

    // If not enough MCQs with answers, include those without
    if (allMcqs.length < questionCount) {
      where = { categorySlug };
      allMcqs = await db.mcq.findMany({
        where,
        select: { id: true }
      });
    }

    if (allMcqs.length === 0) {
      return NextResponse.json({ success: false, error: 'No MCQs found for this category' }, { status: 404 });
    }

    // Shuffle and pick
    const shuffled = allMcqs.sort(() => Math.random() - 0.5);
    const selectedIds = shuffled.slice(0, questionCount).map(m => m.id);

    // Get full MCQ data
    const mcqs = await db.mcq.findMany({
      where: { id: { in: selectedIds } },
      include: { category: { select: { name: true, slug: true, icon: true } } }
    });

    // Return MCQs WITHOUT correct answers for quiz mode
    const quizMcqs = mcqs.map(({ correctAnswer, sourceUrl, ...rest }) => ({
      ...rest,
      hasAnswer: !!correctAnswer
    }));

    // Shuffle question order
    const shuffledQuiz = quizMcqs.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      success: true,
      data: {
        questions: shuffledQuiz,
        totalQuestions: shuffledQuiz.length,
        category: mcqs[0]?.category
      }
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    return NextResponse.json({ success: false, error: 'Failed to start quiz' }, { status: 500 });
  }
}
