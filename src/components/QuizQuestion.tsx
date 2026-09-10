'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { ChevronLeft, ChevronRight, Flag, Send, CheckCircle2, Circle, Clock } from 'lucide-react';

export function QuizQuestion() {
  const {
    quizQuestions,
    quizCurrentIndex,
    quizAnswers,
    setQuizCurrentIndex,
    setQuizAnswer,
    setView,
    setIsLoading,
    setQuizResults,
    setQuizScore,
    setQuizTotal,
    setQuizPercentage,
    quizCategory,
  } = useAppStore();

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = quizQuestions[quizCurrentIndex];
  const totalQuestions = quizQuestions.length;
  const currentAnswer = quizAnswers.find(a => a.mcqId === currentQuestion?.id)?.selectedOption;
  const answeredCount = quizAnswers.length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentQuestion) return null;

  const options = [
    { letter: 'A', text: currentQuestion.optionA },
    { letter: 'B', text: currentQuestion.optionB },
    { letter: 'C', text: currentQuestion.optionC },
    { letter: 'D', text: currentQuestion.optionD },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    setIsLoading(true);

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: quizAnswers })
      });

      const data = await res.json();
      if (data.success) {
        setQuizResults(data.data.results);
        setQuizScore(data.data.score);
        setQuizTotal(data.data.total);
        setQuizPercentage(data.data.percentage);
        setView('quiz-results');
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-[#007540]/10 text-[#007540] border-[#007540]/30">
            {quizCategory?.icon} {quizCategory?.name}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeElapsed)}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {answeredCount}/{totalQuestions} answered
        </div>
      </div>

      {/* Progress */}
      <Progress value={progressPercent} className="h-2 mb-4 bg-gray-100 [&>div]:bg-[#007540]" />

      {/* Question */}
      <Card className="mb-4 border-[#007540]/10">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-5">
            <span className="bg-[#007540] text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0">
              {quizCurrentIndex + 1}
            </span>
            <h2 className="text-base font-medium text-gray-900 leading-relaxed pt-1">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 ml-0 sm:ml-11">
            {options.map(({ letter, text }) => {
              const isSelected = currentAnswer === letter;
              return (
                <button
                  key={letter}
                  onClick={() => setQuizAnswer(currentQuestion.id, letter)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 ${
                    isSelected
                      ? 'border-[#007540] bg-[#007540]/5 shadow-sm'
                      : 'border-gray-200 hover:border-[#007540]/40 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                      isSelected
                        ? 'bg-[#007540] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 className="w-4 h-4" /> : letter}
                  </span>
                  <span className={`text-sm pt-0.5 ${isSelected ? 'font-medium text-[#007540]' : 'text-gray-700'}`}>
                    {text}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Question navigator */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {quizQuestions.map((q, idx) => {
            const isAnswered = quizAnswers.some(a => a.mcqId === q.id);
            const isCurrent = idx === quizCurrentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setQuizCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-[#007540] text-white'
                    : isAnswered
                    ? 'bg-[#007540]/10 text-[#007540] border border-[#007540]/30'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setQuizCurrentIndex(Math.max(0, quizCurrentIndex - 1))}
          disabled={quizCurrentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>

        {quizCurrentIndex < totalQuestions - 1 ? (
          <Button
            onClick={() => setQuizCurrentIndex(quizCurrentIndex + 1)}
            className="bg-[#007540] hover:bg-[#005e33]"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || quizAnswers.length === 0}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {submitting ? (
              'Submitting...'
            ) : (
              <>
                <Flag className="w-4 h-4 mr-1" /> Submit Quiz
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
