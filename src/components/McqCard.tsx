'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

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

  const options = [
    { letter: 'A', text: optionA },
    { letter: 'B', text: optionB },
    { letter: 'C', text: optionC },
    { letter: 'D', text: optionD },
  ];

  const correctLetter = correctAnswer
    ? options.find(o => o.text.trim().toLowerCase() === correctAnswer.trim().toLowerCase())?.letter || ''
    : '';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
        {/* Question header */}
        <div className="flex items-start gap-2 mb-3">
          {index !== undefined && (
            <span className="text-xs font-bold text-[#007540] bg-[#007540]/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
              {index + 1}
            </span>
          )}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 leading-relaxed">{question}</h3>
            <div className="flex items-center gap-2 mt-1">
              {categorySlug ? (
                <Link href={`/${categorySlug}`}>
                  <Badge variant="outline" className="text-xs text-[#007540] border-[#007540]/30 hover:bg-[#007540]/10 cursor-pointer">
                    {categoryName}
                  </Badge>
                </Link>
              ) : (
                <Badge variant="outline" className="text-xs text-[#007540] border-[#007540]/30">
                  {categoryName}
                </Badge>
              )}
              {submittedBy && (
                <span className="text-xs text-gray-400">By: {submittedBy}</span>
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2 ml-0 sm:ml-8">
          {options.map(({ letter, text }) => {
            const isCorrect = revealed && correctLetter === letter;
            const isWrong = revealed && correctLetter && correctLetter !== letter;

            return (
              <div
                key={letter}
                className={`flex items-start gap-2 p-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isCorrect
                    ? 'bg-green-50 border border-green-200'
                    : isWrong
                    ? 'bg-gray-50 border border-gray-100 opacity-60'
                    : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                }`}
              >
                <span
                  className={`font-bold shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    isCorrect
                      ? 'bg-green-500 text-white'
                      : isWrong
                      ? 'bg-gray-300 text-gray-600'
                      : 'bg-[#007540]/10 text-[#007540]'
                  }`}
                >
                  {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : letter}
                </span>
                <span className={`text-gray-700 ${isCorrect ? 'font-medium' : ''}`}>
                  {text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Reveal button */}
        {!showAnswer && hasAnswer && (
          <div className="mt-3 ml-0 sm:ml-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevealed(!revealed)}
              className="text-[#007540] border-[#007540]/30 hover:bg-[#007540]/10"
            >
              {revealed ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 mr-1" /> Hide Answer
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1" /> Show Answer
                </>
              )}
            </Button>
          </div>
        )}

        {!hasAnswer && (
          <div className="mt-3 ml-0 sm:ml-8">
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
              Answer pending - Generate with AI
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
