'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle2,
  XCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface McqDetail {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  submittedBy: string;
  sourceUrl: string;
  difficulty: string;
}

interface RelatedMcq {
  id: string;
  question: string;
  categorySlug: string;
  categoryName: string;
  hasAnswer: boolean;
}

interface McqDetailClientProps {
  mcq: McqDetail;
  prevMcq: RelatedMcq | null;
  nextMcq: RelatedMcq | null;
  relatedMcqs: RelatedMcq[];
}

export function McqDetailClient({ mcq, prevMcq, nextMcq, relatedMcqs }: McqDetailClientProps) {
  const [showAnswer, setShowAnswer] = useState(!!mcq.correctAnswer);
  const [generating, setGenerating] = useState(false);
  const [generatedAnswer, setGeneratedAnswer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const options = [
    { letter: 'A', text: mcq.optionA },
    { letter: 'B', text: mcq.optionB },
    { letter: 'C', text: mcq.optionC },
    { letter: 'D', text: mcq.optionD },
  ];

  const effectiveAnswer = mcq.correctAnswer || generatedAnswer || '';

  const correctLetter = effectiveAnswer
    ? options.find(o => o.text.trim().toLowerCase() === effectiveAnswer.trim().toLowerCase())?.letter || ''
    : '';

  const handleGenerateAnswer = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/answers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcqIds: [mcq.id], limit: 1 }),
      });
      const data = await res.json();
      if (data.success && data.updated > 0) {
        // Re-fetch the MCQ to get the updated answer
        const mcqRes = await fetch(`/api/mcqs/${mcq.id}`);
        const mcqData = await mcqRes.json();
        if (mcqData.success && mcqData.data.correctAnswer) {
          setGeneratedAnswer(mcqData.data.correctAnswer);
          setShowAnswer(true);
        }
      }
    } catch (err) {
      console.error('Failed to generate answer:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${mcq.categoryName} - MCQ`,
          text: mcq.question,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyQuestion = async () => {
    const text = `Q: ${mcq.question}\nA. ${mcq.optionA}\nB. ${mcq.optionB}\nC. ${mcq.optionC}\nD. ${mcq.optionD}${effectiveAnswer ? `\n\nCorrect Answer: ${correctLetter}. ${effectiveAnswer}` : ''}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const difficultyColor: Record<string, string> = {
    easy: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    hard: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 flex-wrap">
        <Link href="/" className="hover:text-[#007540]">Home</Link>
        <span>/</span>
        <Link href={`/${mcq.categorySlug}`} className="hover:text-[#007540]">{mcq.categoryName}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Question</span>
      </nav>

      {/* MCQ Card */}
      <Card className="border-[#007540]/20">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{mcq.categoryIcon}</span>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-relaxed">{mcq.question}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Link href={`/${mcq.categorySlug}`}>
                    <Badge variant="outline" className="text-xs text-[#007540] border-[#007540]/30 hover:bg-[#007540]/10 cursor-pointer">
                      {mcq.categoryName}
                    </Badge>
                  </Link>
                  <Badge variant="outline" className={`text-xs ${difficultyColor[mcq.difficulty] || difficultyColor.medium}`}>
                    {mcq.difficulty}
                  </Badge>
                  {mcq.submittedBy && (
                    <span className="text-xs text-gray-400">By: {mcq.submittedBy}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Options */}
          <div className="space-y-3">
            {options.map(({ letter, text }) => {
              const isCorrect = showAnswer && correctLetter === letter;
              const isWrong = showAnswer && correctLetter && correctLetter !== letter;

              return (
                <div
                  key={letter}
                  className={`flex items-start gap-3 p-4 rounded-lg text-sm transition-all duration-200 border ${
                    isCorrect
                      ? 'bg-green-50 border-green-300'
                      : isWrong
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={`font-bold shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                      isCorrect
                        ? 'bg-green-500 text-white'
                        : isWrong
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-[#007540]/10 text-[#007540]'
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : letter}
                  </span>
                  <span className={`text-gray-700 pt-0.5 ${isCorrect ? 'font-semibold text-green-700' : ''}`}>
                    {text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Answer reveal / generate */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {effectiveAnswer && !showAnswer && (
              <Button
                onClick={() => setShowAnswer(true)}
                className="bg-[#007540] hover:bg-[#005e33]"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Show Answer
              </Button>
            )}
            {!effectiveAnswer && !generating && (
              <Button
                onClick={handleGenerateAnswer}
                variant="outline"
                className="text-[#007540] border-[#007540]/30 hover:bg-[#007540]/10"
              >
                <Sparkles className="h-4 w-4 mr-2" /> Generate Answer with AI
              </Button>
            )}
            {generating && (
              <Button disabled variant="outline">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
              </Button>
            )}
            {showAnswer && effectiveAnswer && (
              <div className="w-full mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-800">
                  Correct Answer: {correctLetter}. {effectiveAnswer}
                </p>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share this question</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleCopyQuestion}>
                    <Copy className="h-4 w-4 mr-1" /> {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy question text</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {mcq.sourceUrl && (
              <a href={mcq.sourceUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" /> Source
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between gap-4">
        {prevMcq ? (
          <Link href={`/${prevMcq.categorySlug}/${prevMcq.id}`}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {nextMcq ? (
          <Link href={`/${nextMcq.categorySlug}/${nextMcq.id}`}>
            <Button variant="outline" size="sm">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Related MCQs */}
      {relatedMcqs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Related Questions</h2>
          <div className="space-y-2">
            {relatedMcqs.map((rmcq) => (
              <Link key={rmcq.id} href={`/${rmcq.categorySlug}/${rmcq.id}`}>
                <Card className="hover:shadow-md hover:border-[#007540]/30 transition-all cursor-pointer">
                  <CardContent className="p-3 flex items-start gap-2">
                    <Badge variant="outline" className="text-xs shrink-0 text-[#007540] border-[#007540]/30">
                      {rmcq.categoryName.replace(/_MCQs$/, '')}
                    </Badge>
                    <p className="text-sm text-gray-700 line-clamp-1">{rmcq.question}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
