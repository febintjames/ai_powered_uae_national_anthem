import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvatarType, Question, QuestionWithAnswer, QuizResult, JobStatus } from '@/app/lib/api';

interface KioskState {
    // Avatar Selection
    avatarType: AvatarType | null;

    // Media
    capturedImage: string | null; // Data URL or blob URL

    // Video Generation
    jobId: string | null;
    videoUrl: string | null;
    qrUrl: string | null;
    processingStatus: JobStatus['status'];
    errorMessage: string | null;

    // Quiz
    quizQuestions: Question[];
    quizKey: QuestionWithAnswer[];
    quizAnswers: (number | null)[];
    quizScore: QuizResult | null;

    // Actions - Avatar
    setAvatarType: (type: AvatarType) => void;

    // Actions - Media
    setCapturedImage: (imageData: string) => void;
    clearImage: () => void;

    // Actions - Video Generation
    setJobId: (id: string) => void;
    setVideoUrl: (url: string) => void;
    setQrUrl: (url: string) => void;
    setProcessingStatus: (status: JobStatus['status']) => void;
    setErrorMessage: (message: string | null) => void;

    // Actions - Quiz
    setQuizQuestions: (questions: Question[], key: QuestionWithAnswer[]) => void;
    setQuizAnswer: (index: number, answer: number | null) => void;
    setQuizScore: (score: QuizResult) => void;
    initializeAnswers: (count: number) => void;

    // Actions - Reset
    resetStore: () => void;
    resetQuiz: () => void;
}

export const useKioskStore = create<KioskState>()(
    persist(
        (set, get) => ({
            // Initial State
            avatarType: null,
            capturedImage: null,
            jobId: null,
            videoUrl: null,
            qrUrl: null,
            processingStatus: 'queued',
            errorMessage: null,
            quizQuestions: [],
            quizKey: [],
            quizAnswers: [],
            quizScore: null,

            // Avatar Actions
            setAvatarType: (type) => set({ avatarType: type }),

            // Media Actions
            setCapturedImage: (imageData) => set({ capturedImage: imageData }),
            clearImage: () => set({ capturedImage: null }),

            // Video Generation Actions
            setJobId: (id) => set({ jobId: id }),
            setVideoUrl: (url) => set({ videoUrl: url }),
            setQrUrl: (url) => set({ qrUrl: url }),
            setProcessingStatus: (status) => set({ processingStatus: status }),
            setErrorMessage: (message) => set({ errorMessage: message }),

            // Quiz Actions
            setQuizQuestions: (questions, key) => set({
                quizQuestions: questions,
                quizKey: key,
                quizAnswers: new Array(questions.length).fill(null)
            }),

            setQuizAnswer: (index, answer) => set((state) => {
                const newAnswers = [...state.quizAnswers];
                newAnswers[index] = answer;
                return { quizAnswers: newAnswers };
            }),

            setQuizScore: (score) => set({ quizScore: score }),

            initializeAnswers: (count) => set({
                quizAnswers: new Array(count).fill(null)
            }),

            resetQuiz: () => set({
                quizQuestions: [],
                quizKey: [],
                quizAnswers: [],
                quizScore: null,
            }),

            // Reset Store
            resetStore: () => set({
                avatarType: null,
                capturedImage: null,
                jobId: null,
                videoUrl: null,
                qrUrl: null,
                processingStatus: 'queued',
                errorMessage: null,
                quizQuestions: [],
                quizKey: [],
                quizAnswers: [],
                quizScore: null,
            }),
        }),
        {
            name: 'kiosk-storage',
            partialize: (state) => ({
                avatarType: state.avatarType,
                jobId: state.jobId,
                videoUrl: state.videoUrl,
                quizScore: state.quizScore,
            }),
        }
    )
);
