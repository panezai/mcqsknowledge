'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Zap } from 'lucide-react';

interface McqItem {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  hasAnswer: boolean;
}

interface QuizDialogProps {
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  children: React.ReactNode;
}

type QuizState = 'setup' | 'playing' | 'results';

export function QuizDialog({ categorySlug, categoryName, categoryIcon, children }: QuizDialogProps) {
  const [open, setOpen] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [questions, setQuestions] = useState<McqItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<{
    score: number;
    total: number;
    percentage: number;
    results: Array<{
      mcqId: string;
      question: string;
      selectedOption: string;
      correctAnswer: string;
      correctAnswerText: string;
      isCorrect: boolean;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categorySlug, count: questionCount }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data.questions);
        setCurrentIndex(0);
        setAnswers({});
        setResults(null);
        setQuizState('playing');
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (letter: string) => {
    if (!questions[currentIndex]) return;
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: letter,
    }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const answerArray = Object.entries(answers).map(([mcqId, selectedOption]) => ({
        mcqId,
        selectedOption,
      }));
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        setQuizState('results');
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuizState('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setResults(null);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetQuiz();
    }
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#007540]" />
            {quizState === 'setup' && `${categoryIcon} ${categoryName} Quiz`}
            {quizState === 'playing' && `Question ${currentIndex + 1} of ${questions.length}`}
            {quizState === 'results' && 'Quiz Results'}
          </DialogTitle>
        </DialogHeader>

        {/* Setup State */}
        {quizState === 'setup' && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-5xl mb-3">{categoryIcon}</div>
              <h3 className="font-bold text-lg">{categoryName}</h3>
              <p className="text-gray-500 text-sm mt-1">Test your knowledge with a quiz</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Number of Questions</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(count => (
                  <Button
                    key={count}
                    variant={questionCount === count ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setQuestionCount(count)}
                    className={questionCount === count ? 'bg-[#007540] hover:bg-[#005e33]' : ''}
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={startQuiz}
              disabled={loading}
              className="w-full bg-[#007540] hover:bg-[#005e33]"
            >
              {loading ? 'Starting...' : 'Start Quiz'}
            </Button>
          </div>
        )}

        {/* Playing State */}
        {quizState === 'playing' && currentQuestion && (
          <div className="space-y-4 py-4">
            <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
            <p className="text-sm font-medium text-gray-900 leading-relaxed">{currentQuestion.question}</p>
            <div className="space-y-2">
              {[
                { letter: 'A', text: currentQuestion.optionA },
                { letter: 'B', text: currentQuestion.optionB },
                { letter: 'C', text: currentQuestion.optionC },
                { letter: 'D', text: currentQuestion.optionD },
              ].map(({ letter, text }) => (
                <button
                  key={letter}
                  onClick={() => selectAnswer(letter)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-sm flex items-start gap-2 ${
                    currentAnswer === letter
                      ? 'bg-[#007540]/10 border-[#007540] text-[#007540]'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className={`font-bold shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    currentAnswer === letter
                      ? 'bg-[#007540] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {letter}
                  </span>
                  <span>{text}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!currentAnswer || loading}
                className="bg-[#007540] hover:bg-[#005e33]"
                size="sm"
              >
                {loading ? 'Submitting...' : currentIndex === questions.length - 1 ? 'Submit Quiz' : 'Next'}
              </Button>
            </div>
            <div className="flex gap-1 justify-center">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex
                      ? 'bg-[#007540] w-4'
                      : answers[questions[i].id]
                      ? 'bg-[#007540]/40'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results State */}
        {quizState === 'results' && results && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <Trophy className={`h-12 w-12 mx-auto mb-2 ${results.percentage >= 60 ? 'text-yellow-500' : 'text-gray-400'}`} />
              <h3 className="font-bold text-2xl">{results.score}/{results.total}</h3>
              <p className="text-gray-500">{results.percentage}% Correct</p>
              <Badge variant={results.percentage >= 60 ? 'default' : 'destructive'} className="mt-2">
                {results.percentage >= 80 ? 'Excellent!' : results.percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
              </Badge>
            </div>
            <Progress value={results.percentage} className="h-3" />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.results.map((r, i) => (
                <Card key={r.mcqId} className={r.isCorrect ? 'border-green-200' : 'border-red-200'}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      {r.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div className="text-xs">
                        <p className="font-medium line-clamp-1">{r.question}</p>
                        {!r.isCorrect && (
                          <p className="text-green-600 mt-0.5">
                            Correct: {r.correctAnswer}. {r.correctAnswerText}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button onClick={resetQuiz} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
