import { create } from 'zustand';

export type ViewType = 'home' | 'category' | 'quiz' | 'quiz-setup' | 'quiz-results' | 'search';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  mcqCount: number;
}

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
  submittedBy?: string;
  hasAnswer: boolean;
}

interface QuizAnswer {
  mcqId: string;
  selectedOption: string;
}

interface QuizResult {
  mcqId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedOption: string;
  correctAnswer: string;
  correctAnswerText: string;
  isCorrect: boolean;
  categoryName: string;
}

interface AppState {
  // Navigation
  currentView: ViewType;
  selectedCategory: Category | null;
  
  // Data
  categories: Category[];
  mcqs: McqItem[];
  mcqsTotal: number;
  mcqsPage: number;
  searchQuery: string;
  
  // Quiz
  quizQuestions: McqItem[];
  quizCurrentIndex: number;
  quizAnswers: QuizAnswer[];
  quizResults: QuizResult[] | null;
  quizScore: number;
  quizTotal: number;
  quizPercentage: number;
  quizCategory: Category | null;
  
  // UI
  isLoading: boolean;
  sidebarOpen: boolean;
  
  // Actions
  setView: (view: ViewType) => void;
  setSelectedCategory: (category: Category | null) => void;
  setCategories: (categories: Category[]) => void;
  setMcqs: (mcqs: McqItem[]) => void;
  setMcqsTotal: (total: number) => void;
  setMcqsPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setQuizQuestions: (questions: McqItem[]) => void;
  setQuizCurrentIndex: (index: number) => void;
  setQuizAnswer: (mcqId: string, option: string) => void;
  setQuizResults: (results: QuizResult[] | null) => void;
  setQuizScore: (score: number) => void;
  setQuizTotal: (total: number) => void;
  setQuizPercentage: (percentage: number) => void;
  setQuizCategory: (category: Category | null) => void;
  setIsLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  resetQuiz: () => void;
  goHome: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'home',
  selectedCategory: null,
  
  // Data
  categories: [],
  mcqs: [],
  mcqsTotal: 0,
  mcqsPage: 1,
  searchQuery: '',
  
  // Quiz
  quizQuestions: [],
  quizCurrentIndex: 0,
  quizAnswers: [],
  quizResults: null,
  quizScore: 0,
  quizTotal: 0,
  quizPercentage: 0,
  quizCategory: null,
  
  // UI
  isLoading: false,
  sidebarOpen: false,
  
  // Actions
  setView: (view) => set({ currentView: view }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setCategories: (categories) => set({ categories }),
  setMcqs: (mcqs) => set({ mcqs }),
  setMcqsTotal: (total) => set({ mcqsTotal: total }),
  setMcqsPage: (page) => set({ mcqsPage: page }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setQuizQuestions: (questions) => set({ quizQuestions: questions }),
  setQuizCurrentIndex: (index) => set({ quizCurrentIndex: index }),
  setQuizAnswer: (mcqId, option) => set((state) => {
    const existing = state.quizAnswers.findIndex(a => a.mcqId === mcqId);
    const newAnswers = [...state.quizAnswers];
    if (existing >= 0) {
      newAnswers[existing] = { mcqId, selectedOption: option };
    } else {
      newAnswers.push({ mcqId, selectedOption: option });
    }
    return { quizAnswers: newAnswers };
  }),
  setQuizResults: (results) => set({ quizResults: results }),
  setQuizScore: (score) => set({ quizScore: score }),
  setQuizTotal: (total) => set({ quizTotal: total }),
  setQuizPercentage: (percentage) => set({ quizPercentage: percentage }),
  setQuizCategory: (category) => set({ quizCategory: category }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  resetQuiz: () => set({
    quizQuestions: [],
    quizCurrentIndex: 0,
    quizAnswers: [],
    quizResults: null,
    quizScore: 0,
    quizTotal: 0,
    quizPercentage: 0,
    quizCategory: null,
  }),
  goHome: () => set({
    currentView: 'home',
    selectedCategory: null,
    searchQuery: '',
    mcqsPage: 1,
  }),
}));
