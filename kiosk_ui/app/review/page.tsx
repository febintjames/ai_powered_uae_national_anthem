'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/app/store/kioskStore';
import BackgroundWrapper from '@/app/components/BackgroundWrapper';

export default function Review() {
    const router = useRouter();
    const { videoUrl } = useKioskStore();

    useEffect(() => {
        if (!videoUrl) {
            router.push('/avatar-selection');
        }
    }, [videoUrl, router]);

    const handleNext = () => {
        router.push('/qr');
    };

    const handleReplay = () => {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            videoElement.currentTime = 0;
            videoElement.play();
        }
    };

    if (!videoUrl) {
        return null;
    }

    return (
        <BackgroundWrapper>
            <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8">
                <div className="bg-white bg-opacity-95 px-6 py-6 rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col items-center max-h-[90vh]">
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-emerald-600 text-center mb-2 shrink-0">
                        Your Personalized Video
                    </h1>
                    <p className="text-center text-gray-600 mb-4 shrink-0 text-sm md:text-base">
                        Watch your UAE National Anthem video!
                    </p>

                    {/* Video Player */}
                    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl mb-4 w-full flex-1 min-h-0 flex items-center justify-center">
                        <video
                            src={videoUrl}
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    {/* Info Box */}
                    <div className="bg-emerald-50 border-2 border-emerald-600 rounded-lg p-3 mb-4 shrink-0 w-full">
                        <p className="text-xs md:text-sm text-gray-700 text-center">
                            <span className="font-semibold text-emerald-600">Next:</span>{' '}
                            Get your QR code to easily download and share this video
                        </p>
                    </div>

                    {/* Button Group */}
                    <div className="flex gap-4 w-full shrink-0">
                        <button
                            onClick={handleReplay}
                            className="flex-1 px-6 py-3 md:px-8 md:py-4 bg-gray-600 hover:bg-gray-700 text-white text-base md:text-lg font-bold rounded-full uppercase tracking-wider transition-all duration-300 shadow-lg"
                        >
                            ▶️ Replay
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-1 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-base md:text-lg font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-emerald-600/60"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </BackgroundWrapper>
    );
}