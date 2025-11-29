'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/app/store/kioskStore';
import BackgroundWrapper from '@/app/components/BackgroundWrapper';
import { submitAnswers } from '@/app/lib/api';

export default function Quiz() {
    const router = useRouter();
    const {
        jobId,
        quizQuestions,
        quizKey,
        quizAnswers,
        setQuizAnswer,
        setQuizScore,
    } = useKioskStore();

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Redirect if no quiz data
        if (!jobId || quizQuestions.length === 0) {
            router.push('/avatar-selection');
        }
    }, [jobId, quizQuestions, router]);

    const handleAnswerSelect = (optionIndex: number) => {
        setQuizAnswer(currentQuestion, optionIndex);
    };

    const handleNext = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        if (!jobId) return;

        try {
            setSubmitting(true);
            setError('');

            const result = await submitAnswers(jobId, quizKey, quizAnswers);
            setQuizScore(result);
            setShowScore(true);

            // Navigate to processing after showing score
            setTimeout(() => {
                router.push('/processing');
            }, 3000);

        } catch (err) {
            console.error('Submit error:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit answers');
            setSubmitting(false);
        }
    };

    if (!jobId || quizQuestions.length === 0) {
        return null; // Will redirect in useEffect
    }

    const question = quizQuestions[currentQuestion];
    const selectedAnswer = quizAnswers[currentQuestion];
    const isLastQuestion = currentQuestion === quizQuestions.length - 1;
    const allAnswered = quizAnswers.every(a => a !== null);

    // Score Display
    if (showScore) {
        const score = useKioskStore.getState().quizScore;
        if (!score) return null;

        const percentage = score.score;
        const stars = Math.round((percentage / 100) * 10);

        return (
            <BackgroundWrapper>
                <div className="flex flex-col items-center justify-center w-full max-w-2xl px-4">
                    <div className="bg-white bg-opacity-95 px-16 py-20 rounded-3xl shadow-2xl text-center w-full">
                        {/* Success Animation */}
                        <div className="text-8xl mb-6 animate-bounce">
                            🎉
                        </div>

                        <h1 className="text-5xl font-bold text-emerald-600 mb-4">
                            Great Job!
                        </h1>

                        <p className="text-3xl font-bold text-gray-800 mb-6">
                            You scored {score.correct}/{score.total}
                        </p>

                        <p className="text-4xl font-bold text-emerald-600 mb-8">
                            {percentage}%
                        </p>

                        {/* Star Rating */}
                        <div className="text-5xl mb-8">
                            {'⭐'.repeat(stars)}{'☆'.repeat(10 - stars)}
                        </div>

                        {/* Message */}
                        <div className="bg-emerald-50 border-2 border-emerald-600 rounded-lg px-6 py-4">
                            <p className="text-lg text-gray-700">
                                Your video is being generated...
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </BackgroundWrapper>
        );
    }

    // Quiz Display
    return (
        <BackgroundWrapper>
            <div className="flex flex-col items-center justify-center w-full max-w-3xl px-4 py-8">
                <div className="bg-white bg-opacity-95 px-12 py-16 rounded-3xl shadow-2xl w-full">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-emerald-600 text-center mb-2">
                            UAE National Day Quiz
                        </h1>
                        <p className="text-center text-gray-600">
                            Question {currentQuestion + 1} of {quizQuestions.length}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-300 rounded-full h-3 mb-8">
                        <div
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                        />
                    </div>

                    {/* Question */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 leading-relaxed">
                            {question.question}
                        </h2>

                        {/* Options */}
                        <div className="space-y-4">
                            {question.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    className={`
                    w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200
                    hover:shadow-lg
                    ${selectedAnswer === index
                                            ? 'border-emerald-600 bg-emerald-50 shadow-md'
                                            : 'border-gray-300 bg-white hover:border-emerald-400'
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Radio Button */}
                                        <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${selectedAnswer === index
                                                ? 'border-emerald-600 bg-emerald-600'
                                                : 'border-gray-400'
                                            }
                    `}>
                                            {selectedAnswer === index && (
                                                <div className="w-3 h-3 bg-white rounded-full" />
                                            )}
                                        </div>

                                        {/* Option Text */}
                                        <span className={`
                      text-lg
                      ${selectedAnswer === index ? 'font-semibold text-emerald-600' : 'text-gray-700'}
                    `}>
                                            {option}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-500 rounded-lg px-4 py-3 mb-6">
                            <p className="text-red-700 text-center">{error}</p>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white text-lg font-bold rounded-full uppercase tracking-wider transition-all duration-300 shadow-lg disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        {isLastQuestion ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !allAnswered}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-emerald-600/60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {submitting ? 'Submitting...' : 'Submit Answers'}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={selectedAnswer === null}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-emerald-600/60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                Next
                            </button>
                        )}
                    </div>

                    {/* Hint */}
                    {!allAnswered && isLastQuestion && (
                        <p className="text-center text-gray-600 mt-4 text-sm">
                            Please answer all questions before submitting
                        </p>
                    )}
                </div>
            </div>
        </BackgroundWrapper>
    );
}
