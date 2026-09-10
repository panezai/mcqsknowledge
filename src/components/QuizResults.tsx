'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Eye } from 'lucide-react';
import { useState } from 'react';

export function QuizResults() {
  const { quizResults, quizScore, quizTotal, quizPercentage, quizCategory, resetQuiz, setView } = useAppStore();
  const [showReview, setShowReview] = useState(false);

  if (!quizResults) return null;

  const isPassed = quizPercentage >= 60;
  const gradeEmoji = quizPercentage >= 90 ? '🏆' : quizPercentage >= 70 ? '🎉' : quizPercentage >= 60 ? '👍' : '📚';

  return (
    <div>
      {/* Results summary */}
      <Card className={`border-2 ${isPassed ? 'border-green-200 bg-green-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="text-6xl mb-3">{gradeEmoji}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <p className="text-gray-500 mb-4">
            {quizCategory?.icon} {quizCategory?.name || 'Quiz'} Completed
          </p>

          <div className="flex justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#007540]">{quizScore}</div>
              <div className="text-xs text-gray-500">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">{quizTotal - quizScore}</div>
              <div className="text-xs text-gray-500">Wrong</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">{quizTotal}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>

          <div className="max-w-xs mx-auto mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Score</span>
              <span className="font-bold">{quizPercentage}%</span>
            </div>
            <Progress
              value={quizPercentage}
              className={`h-3 ${isPassed ? '[&>div]:bg-green-500' : '[&>div]:bg-amber-500'}`}
            />
          </div>

          <Badge
            className={`text-sm ${isPassed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
          >
            {isPassed ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}
          </Badge>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <Button
          variant="outline"
          onClick={() => { resetQuiz(); setView('quiz-setup'); }}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Try Again
        </Button>
        <Button
          onClick={() => setShowReview(!showReview)}
          className="flex-1 bg-[#007540] hover:bg-[#005e33]"
        >
          <Eye className="w-4 h-4 mr-2" /> {showReview ? 'Hide Review' : 'Review Answers'}
        </Button>
        <Button
          variant="outline"
          onClick={() => { resetQuiz(); useAppStore.getState().goHome(); }}
          className="flex-1"
        >
          Close
        </Button>
      </div>

      {/* Review section */}
      {showReview && (
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Answer Review</h3>
          {quizResults.map((result, idx) => (
            <Card
              key={result.mcqId}
              className={`border ${result.isCorrect ? 'border-green-200' : 'border-red-200'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    result.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {result.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  </span>
                  <p className="text-sm text-gray-900 font-medium">{result.question}</p>
                </div>
                <div className="ml-8 space-y-1.5 text-sm">
                  {[
                    { letter: 'A', text: result.optionA },
                    { letter: 'B', text: result.optionB },
                    { letter: 'C', text: result.optionC },
                    { letter: 'D', text: result.optionD },
                  ].map(({ letter, text }) => {
                    const isSelected = result.selectedOption === letter;
                    const isCorrectOption = result.correctAnswer === letter;
                    return (
                      <div
                        key={letter}
                        className={`flex items-center gap-2 p-1.5 rounded ${
                          isCorrectOption
                            ? 'bg-green-50 text-green-700 font-medium'
                            : isSelected && !isCorrectOption
                            ? 'bg-red-50 text-red-700 line-through'
                            : 'text-gray-500'
                        }`}
                      >
                        <span className="font-bold text-xs">{letter}.</span>
                        <span>{text}</span>
                        {isCorrectOption && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />}
                        {isSelected && !isCorrectOption && <XCircle className="w-3.5 h-3.5 text-red-500 ml-auto" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
