import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categorySlug, count = 10 } = body;

    if (!categorySlug) {
      return NextResponse.json({ success: false, error: 'Category slug is required' }, { status: 400 });
    }

    const questionCount = Math.min(Math.max(count, 1), 50);

    let where: any = { categorySlug };

    let allMcqs = await db.mcq.findMany({
      where,
    });

    if (allMcqs.length === 0) {
      return NextResponse.json({ success: false, error: 'No MCQs found for this category' }, { status: 404 });
    }

    // Shuffle and pick
    const shuffled = [...allMcqs].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, questionCount);

    // Return MCQs WITHOUT correct answers for quiz mode
    const quizMcqs = selected.map(({ correctAnswer, sourceUrl, ...rest }: any) => ({
      ...rest,
      categoryName: rest.category?.name || '',
      categoryIcon: rest.category?.icon || '📚',
      hasAnswer: !!correctAnswer
    }));

    return NextResponse.json({
      success: true,
      data: {
        questions: quizMcqs,
        totalQuestions: quizMcqs.length,
        category: selected[0]?.category
      }
    });
  } catch (error: any) {
    console.error('Error starting quiz:', error);
    return NextResponse.json({ success: false, error: 'Failed to start quiz', details: error?.message || String(error) }, { status: 500 });
  }
}
