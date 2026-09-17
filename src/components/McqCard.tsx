'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Eye, EyeOff, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface McqCardProps {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
  categoryName: string;
  categoryIcon?: string;
  categorySlug?: string;
  submittedBy?: string;
  hasAnswer: boolean;
  showAnswer?: boolean;
  index?: number;
}

export function McqCard({
  id,
  question,
  optionA,
  optionB,
  optionC,
  optionD,
  correctAnswer,
  categoryName,
  categoryIcon,
  categorySlug,
  submittedBy,
  hasAnswer,
  showAnswer = false,
  index,
}: McqCardProps) {
  const [revealed, setRevealed] = useState(showAnswer);
  const [copied, setCopied] = useState(false);

  const options = [
    { letter: 'A', text: optionA },
    { letter: 'B', text: optionB },
    { letter: 'C', text: optionC },
    { letter: 'D', text: optionD },
  ].filter(o => o.text && o.text.trim().length > 0);

  const correctLetter = correctAnswer
    ? options.find(o => o.text.trim().toLowerCase() === correctAnswer.trim().toLowerCase())?.letter ||
      (options.some(o => o.letter === correctAnswer.trim().toUpperCase()) ? correctAnswer.trim().toUpperCase() : '')
    : '';

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/${categorySlug || 'general_knowledge_mcqs'}/${id}` : '';
    const shareText = `Q: ${question}\n\nA) ${optionA}\nB) ${optionB}\nC) ${optionC}\nD) ${optionD}\n\nPractice on MCQs Knowledge: ${shareUrl}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success('Question copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-gray-200/80 rounded-xl overflow-hidden" suppressHydrationWarning>
      <CardContent className="p-3.5 sm:p-5 space-y-3">
        {/* Question Header */}
        <div className="flex items-start gap-2 sm:gap-3" suppressHydrationWarning>
          {index !== undefined && (
            <span className="text-xs font-bold text-[#007540] bg-[#007540]/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
              {index + 1}
            </span>
          )}
          <div className="flex-1 min-w-0" suppressHydrationWarning>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug sm:leading-relaxed break-words">
              {question}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2" suppressHydrationWarning>
              {categorySlug ? (
                <Link href={`/${categorySlug}`}>
                  <Badge variant="outline" className="text-[11px] sm:text-xs text-[#007540] border-[#007540]/30 hover:bg-[#007540]/10 cursor-pointer py-0.5 px-2">
                    {categoryIcon && <span className="mr-1">{categoryIcon}</span>}
                    {categoryName}
                  </Badge>
                </Link>
              ) : (
                <Badge variant="outline" className="text-[11px] sm:text-xs text-[#007540] border-[#007540]/30 py-0.5 px-2">
                  {categoryName}
                </Badge>
              )}
              {submittedBy && (
                <span className="text-[11px] text-gray-400 truncate max-w-[150px]">By: {submittedBy}</span>
              )}
            </div>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-2 pt-1" suppressHydrationWarning>
          {options.map(({ letter, text }) => {
            const isCorrect = revealed && correctLetter === letter;
            const isWrong = revealed && correctLetter && correctLetter !== letter;

            return (
              <div
                key={letter}
                suppressHydrationWarning
                onClick={() => setRevealed(true)}
                className={`flex items-start gap-2.5 p-3 rounded-lg text-xs sm:text-sm min-h-[44px] cursor-pointer touch-manipulation transition-all duration-200 ${
                  isCorrect
                    ? 'bg-green-50/90 border border-green-300 text-green-950 font-medium'
                    : isWrong
                    ? 'bg-gray-50/70 border border-gray-100 opacity-60'
                    : 'bg-gray-50 border border-gray-150 hover:bg-gray-100/80 text-gray-800'
                }`}
              >
                <span
                  className={`font-bold shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                    isCorrect
                      ? 'bg-green-600 text-white'
                      : isWrong
                      ? 'bg-gray-300 text-gray-600'
                      : 'bg-[#007540]/10 text-[#007540]'
                  }`}
                >
                  {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : letter}
                </span>
                <span className="flex-1 leading-snug pt-0.5">{text}</span>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100" suppressHydrationWarning>
          {!showAnswer && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevealed(!revealed)}
              className="text-xs text-[#007540] border-[#007540]/30 hover:bg-[#007540]/10 h-8 px-3 rounded-lg"
            >
              {revealed ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 mr-1.5" /> Hide Answer
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> Show Answer
                </>
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-xs text-gray-500 hover:text-gray-900 h-8 px-2.5 rounded-lg ml-auto"
            title="Share or Copy Question"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-green-600" /> Copied
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 mr-1" /> Share
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
