import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mcq = await db.mcq.findUnique({
      where: { id },
      include: {
        category: { select: { name: true, slug: true, icon: true } }
      }
    });

    if (!mcq) {
      return NextResponse.json({ success: false, error: 'MCQ not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
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
        createdAt: mcq.createdAt,
      }
    });
  } catch (error) {
    console.error('Error fetching MCQ:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch MCQ' }, { status: 500 });
  }
}
