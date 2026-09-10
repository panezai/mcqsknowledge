import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mcqIds, limit = 5 } = body;

    // Cap limit to avoid rate limiting
    const effectiveLimit = Math.min(limit, 5);

    // Find MCQs that need answers
    let mcqsNeedingAnswers;
    if (mcqIds && Array.isArray(mcqIds)) {
      mcqsNeedingAnswers = await db.mcq.findMany({
        where: { id: { in: mcqIds }, correctAnswer: '' },
        take: effectiveLimit
      });
    } else {
      mcqsNeedingAnswers = await db.mcq.findMany({
        where: { correctAnswer: '' },
        take: effectiveLimit
      });
    }

    if (mcqsNeedingAnswers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All MCQs already have correct answers',
        updated: 0,
        remaining: 0
      });
    }

    // Use LLM to generate correct answers
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    let updated = 0;
    let errors = 0;

    for (const mcq of mcqsNeedingAnswers) {
      try {
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content: 'You are an expert in general knowledge and academic subjects. Given a multiple choice question, identify the correct answer. Respond ONLY with the letter (A, B, C, or D) of the correct option. Nothing else.'
            },
            {
              role: 'user',
              content: `Question: ${mcq.question}\n\nA. ${mcq.optionA}\nB. ${mcq.optionB}\nC. ${mcq.optionC}\nD. ${mcq.optionD}\n\nWhich option (A, B, C, or D) is correct?`
            }
          ],
          thinking: { type: 'disabled' }
        });

        const response = completion.choices[0]?.message?.content?.trim() || '';
        const letterMatch = response.match(/\b([A-D])\b/);

        if (letterMatch) {
          const letter = letterMatch[1];
          const answerMap: Record<string, string> = {
            'A': mcq.optionA,
            'B': mcq.optionB,
            'C': mcq.optionC,
            'D': mcq.optionD,
          };

          const correctAnswer = answerMap[letter];
          if (correctAnswer && correctAnswer !== 'N/A') {
            await db.mcq.update({
              where: { id: mcq.id },
              data: { correctAnswer }
            });
            updated++;
          }
        }

        // Add delay between requests to avoid rate limiting
        await delay(2000);
      } catch (e: any) {
        errors++;
        console.error(`Failed to generate answer for MCQ ${mcq.id}:`, e?.message?.substring(0, 80));
        // If rate limited, wait longer
        if (e?.message?.includes('429')) {
          await delay(10000);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: mcqsNeedingAnswers.length,
      updated,
      errors,
      remaining: await db.mcq.count({ where: { correctAnswer: '' } })
    });
  } catch (error) {
    console.error('Error generating answers:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate answers' }, { status: 500 });
  }
}
