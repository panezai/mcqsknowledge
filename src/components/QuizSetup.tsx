'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';
import { Play, Loader2 } from 'lucide-react';

export function QuizSetup() {
  const { categories, setView, setQuizQuestions, setQuizCategory, setIsLoading, setQuizTotal } = useAppStore();
  const [selectedSlug, setSelectedSlug] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [loading, setLoading] = useState(false);

  const categoriesWithMcqs = categories.filter(c => c.mcqCount > 0);

  const handleStartQuiz = async () => {
    if (!selectedSlug) return;

    setLoading(true);
    setIsLoading(true);

    try {
      const cat = categories.find(c => c.slug === selectedSlug);
      if (cat) setQuizCategory(cat);

      const res = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categorySlug: selectedSlug,
          count: parseInt(questionCount)
        })
      });

      const data = await res.json();
      if (data.success) {
        setQuizQuestions(data.data.questions);
        setQuizTotal(data.data.totalQuestions);
        setView('quiz');
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card className="border-[#007540]/20">
        <CardHeader className="bg-[#007540]/5 border-b border-[#007540]/10">
          <CardTitle className="text-[#007540] flex items-center gap-2">
            <Play className="w-5 h-5" />
            Start a Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Select Category</Label>
            <Select value={selectedSlug} onValueChange={setSelectedSlug}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a subject..." />
              </SelectTrigger>
              <SelectContent>
                {categoriesWithMcqs.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.name} ({cat.mcqCount} MCQs)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="count" className="text-sm font-medium">Number of Questions</Label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
                <SelectItem value="15">15 Questions</SelectItem>
                <SelectItem value="20">20 Questions</SelectItem>
                <SelectItem value="30">30 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedSlug && (
            <div className="bg-[#007540]/5 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                You will answer <strong>{questionCount}</strong> questions from{' '}
                <strong>{categories.find(c => c.slug === selectedSlug)?.name}</strong>.
                {' '}Select the correct option for each question. You can navigate between questions and review before submitting.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { useAppStore.getState().goHome(); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartQuiz}
              disabled={!selectedSlug || loading}
              className="flex-1 bg-[#007540] hover:bg-[#005e33]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Start Quiz
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
