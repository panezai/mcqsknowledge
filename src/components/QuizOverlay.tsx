'use client';

import { useAppStore } from '@/store/useAppStore';
import { QuizSetup } from './QuizSetup';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function QuizOverlay() {
  const { currentView, goHome } = useAppStore();

  const isQuizView = currentView === 'quiz-setup' || currentView === 'quiz' || currentView === 'quiz-results';

  const handleClose = () => {
    goHome();
  };

  const getTitle = () => {
    switch (currentView) {
      case 'quiz-setup': return 'Start a Quiz';
      case 'quiz': return 'Quiz in Progress';
      case 'quiz-results': return 'Quiz Results';
      default: return 'Quiz';
    }
  };

  return (
    <Dialog open={isQuizView} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>{getTitle()}</DialogTitle>
        </VisuallyHidden>
        <div className="p-6">
          {currentView === 'quiz-setup' && <QuizSetup />}
          {currentView === 'quiz' && <QuizQuestion />}
          {currentView === 'quiz-results' && <QuizResults />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
