'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/app/store/kioskStore';
import BackgroundWrapper from '@/app/components/BackgroundWrapper';

export default function Quiz() {
    const router = useRouter();
    const {
        jobId,
        quizQuestions,
        quizKey,
        quizAnswers,
        setQuizAnswer,
    } = useKioskStore();

    const [currentQuestion, setCurrentQuestion] = useState(0);

    useEffect(() => {
        // Redirect if no quiz data
        if (!jobId || quizQuestions.length === 0) {
            router.push('/avatar-selection');
        }
    }, [jobId, quizQuestions, router]);

    const handleAnswerSelect = (optionIndex: number) => {
        setQuizAnswer(currentQuestion, optionIndex);

        // Auto-advance after a brief delay to show feedback
        setTimeout(() => {
            if (currentQuestion < quizQuestions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
            } else {
                // Last question - go directly to processing (skip puzzle)
                router.push('/processing');
            }
        }, 800); // 800ms to see the green/red feedback
    };

    if (!jobId || quizQuestions.length === 0) {
        return null; // Will redirect in useEffect
    }

    const question = quizQuestions[currentQuestion];
    const selectedAnswer = quizAnswers[currentQuestion];
    const correctAnswer = quizKey[currentQuestion]?.answer;

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
                            {question.options.map((option, index) => {
                                const isSelected = selectedAnswer === index;
                                const isCorrect = index === correctAnswer;
                                const showFeedback = selectedAnswer !== null;

                                let buttonClass = 'border-gray-300 bg-white hover:border-emerald-400';
                                let textClass = 'text-gray-700';
                                let icon = null;

                                if (showFeedback) {
                                    if (isSelected) {
                                        if (isCorrect) {
                                            // Selected and correct
                                            buttonClass = 'border-green-600 bg-green-50 shadow-lg';
                                            textClass = 'text-green-700 font-bold';
                                            icon = '✓';
                                        } else {
                                            // Selected but wrong
                                            buttonClass = 'border-red-600 bg-red-50 shadow-lg';
                                            textClass = 'text-red-700 font-bold';
                                            icon = '✗';
                                        }
                                    } else if (isCorrect) {
                                        // Show correct answer in green (with checkmark)
                                        buttonClass = 'border-green-600 bg-green-50 shadow-lg';
                                        textClass = 'text-green-700 font-bold';
                                        icon = '✓';
                                    }
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => selectedAnswer === null && handleAnswerSelect(index)}
                                        disabled={selectedAnswer !== null}
                                        className={`
                                            w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200
                                            ${buttonClass}
                                            ${selectedAnswer === null ? 'hover:shadow-lg cursor-pointer' : 'cursor-not-allowed'}
                                        `}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            {/* Option Text */}
                                            <span className={`text-lg ${textClass}`}>
                                                {option}
                                            </span>

                                            {/* Feedback Icon */}
                                            {icon && (
                                                <div className={`
                                                    text-2xl font-bold
                                                    ${isCorrect ? 'text-green-600' : 'text-red-600'}
                                                `}>
                                                    {icon}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Auto-advancing message */}
                    {selectedAnswer !== null && (
                        <div className="text-center mt-6">
                            <p className="text-gray-600 text-sm">
                                {currentQuestion < quizQuestions.length - 1
                                    ? 'Moving to next question...'
                                    : 'Processing your video...'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </BackgroundWrapper>
    );
}
