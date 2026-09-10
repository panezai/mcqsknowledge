import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body as { answers: { mcqId: string; selectedOption: string }[] };

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: 'Answers array is required' }, { status: 400 });
    }

    // Get all MCQs that were answered
    const mcqIds = answers.map(a => a.mcqId);
    const mcqs = await db.mcq.findMany({
      where: { id: { in: mcqIds } },
      include: { category: { select: { name: true, slug: true } } }
    });

    // Grade each answer
    const results = answers.map(answer => {
      const mcq = mcqs.find(m => m.id === answer.mcqId);
      if (!mcq) {
        return {
          mcqId: answer.mcqId,
          selectedOption: answer.selectedOption,
          correctAnswer: 'Unknown',
          isCorrect: false,
          question: 'Unknown question',
          optionA: '', optionB: '', optionC: '', optionD: '',
          categoryName: ''
        };
      }

      const correctOption = getOptionLetter(mcq.correctAnswer, mcq);
      const isCorrect = answer.selectedOption === correctOption;

      return {
        mcqId: mcq.id,
        question: mcq.question,
        optionA: mcq.optionA,
        optionB: mcq.optionB,
        optionC: mcq.optionC,
        optionD: mcq.optionD,
        selectedOption: answer.selectedOption,
        correctAnswer: correctOption,
        correctAnswerText: mcq.correctAnswer,
        isCorrect,
        categoryName: mcq.category.name
      };
    });

    const score = results.filter(r => r.isCorrect).length;
    const total = results.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        results,
        score,
        total,
        percentage,
        passed: percentage >= 60
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit quiz' }, { status: 500 });
  }
}

function getOptionLetter(correctAnswer: string, mcq: { optionA: string; optionB: string; optionC: string; optionD: string }): string {
  if (!correctAnswer) return '';
  const clean = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  const answer = clean(correctAnswer);

  if (clean(mcq.optionA) === answer) return 'A';
  if (clean(mcq.optionB) === answer) return 'B';
  if (clean(mcq.optionC) === answer) return 'C';
  if (clean(mcq.optionD) === answer) return 'D';

  // Partial match
  if (mcq.optionA.toLowerCase().includes(answer)) return 'A';
  if (mcq.optionB.toLowerCase().includes(answer)) return 'B';
  if (mcq.optionC.toLowerCase().includes(answer)) return 'C';
  if (mcq.optionD.toLowerCase().includes(answer)) return 'D';

  // Answer contains option text
  if (answer.includes(clean(mcq.optionA))) return 'A';
  if (answer.includes(clean(mcq.optionB))) return 'B';
  if (answer.includes(clean(mcq.optionC))) return 'C';
  if (answer.includes(clean(mcq.optionD))) return 'D';

  return '';
}
