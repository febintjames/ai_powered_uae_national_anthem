'use client';

import React from 'react';

interface BackgroundWrapperProps {
    children: React.ReactNode;
}

export default function BackgroundWrapper({ children }: BackgroundWrapperProps) {
    return (
        <div className="relative min-h-screen font-sans overflow-hidden">
            {/* Animated Background - More blended */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-black to-red-600"></div>

            {/* Subtle animated overlay with better blending */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-transparent to-red-600/20 animate-pulse-slow"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 via-emerald-600/10 to-black/20 animate-gradient"></div>
            </div>

            {/* Floating subtle shapes for depth */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-600 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-float-delayed"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center">
                {children}
            </div>

            <style jsx>{`
                @keyframes gradient {
                    0% {
                        transform: rotate(0deg) scale(1);
                    }
                    50% {
                        transform: rotate(180deg) scale(1.1);
                    }
                    100% {
                        transform: rotate(360deg) scale(1);
                    }
                }

                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -30px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }

                @keyframes float-delayed {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(-30px, 30px) scale(0.9);
                    }
                    66% {
                        transform: translate(20px, -20px) scale(1.1);
                    }
                }

                .animate-gradient {
                    animation: gradient 15s ease infinite;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }

                .animate-float {
                    animation: float 20s ease-in-out infinite;
                }

                .animate-float-delayed {
                    animation: float-delayed 25s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
