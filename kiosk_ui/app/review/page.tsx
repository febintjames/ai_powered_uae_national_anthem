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
      <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 py-8">
        <div className="bg-white bg-opacity-95 px-12 py-16 rounded-3xl shadow-2xl w-full">
          {/* Title */}
          <h1 className="text-4xl font-bold text-emerald-600 text-center mb-2">
            Your Personalized Video
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Watch your UAE National Anthem video!
          </p>

          {/* Video Player */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl mb-8">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-auto"
              style={{ maxHeight: '600px' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Info Box */}
          <div className="bg-emerald-50 border-2 border-emerald-600 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-700 text-center">
              <span className="font-semibold text-emerald-600">Next:</span>{' '}
              Get your QR code to easily download and share this video
            </p>
          </div>

          {/* Button Group */}
          <div className="flex gap-4">
            <button
              onClick={handleReplay}
              className="flex-1 px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white text-lg font-bold rounded-full uppercase tracking-wider transition-all duration-300 shadow-lg"
            >
              ▶️ Replay
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-lg font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-emerald-600/60"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
}