'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/app/store/kioskStore';
import BackgroundWrapper from '@/app/components/BackgroundWrapper';
import { checkJobStatus } from '@/app/lib/api';

export default function Processing() {
  const router = useRouter();
  const { jobId, setVideoUrl, setQrUrl, setProcessingStatus, setErrorMessage } = useKioskStore();

  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState<'queued' | 'image' | 'video' | 'completed' | 'failed'>('queued');
  const [currentMessage, setCurrentMessage] = useState('Initializing...');

  useEffect(() => {
    if (!jobId) {
      router.push('/avatar-selection');
      return;
    }

    let interval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const status = await checkJobStatus(jobId);
        console.log('Job status:', status);

        setCurrentStatus(status.status);
        setProcessingStatus(status.status);

        if (status.status === 'completed') {
          clearInterval(interval);
          clearInterval(progressInterval);
          setProgress(100);
          setVideoUrl(status.video_url || '');
          setQrUrl(status.qr_url || '');

          // Navigate to review after a brief delay
          setTimeout(() => {
            router.push('/review');
          }, 1000);
        } else if (status.status === 'failed') {
          clearInterval(interval);
          clearInterval(progressInterval);
          setErrorMessage(status.error || 'Video generation failed');
        } else {
          // Update message based on status
          if (status.status === 'image') {
            setCurrentMessage('Processing your face...');
          } else if (status.status === 'video') {
            setCurrentMessage('Generating your personalized video...');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to check status');
      }
    };

    // Check immediately
    pollStatus();

    // Poll every 2 seconds
    interval = setInterval(pollStatus, 2000);

    // Simulate progress (purely visual)
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (currentStatus === 'completed') return 100;
        if (currentStatus === 'failed') return prev;
        // Gradually increase but never reach 100 until completed
        return Math.min(prev + Math.random() * 15, 95);
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [jobId, router, setVideoUrl, setQrUrl, setProcessingStatus, setErrorMessage, currentStatus]);

  if (!jobId) {
    return null;
  }

  const error = useKioskStore.getState().errorMessage;

  if (error) {
    return (
      <BackgroundWrapper>
        <div className="flex flex-col items-center justify-center w-full max-w-lg px-4">
          <div className="bg-white bg-opacity-95 px-16 py-20 rounded-3xl shadow-2xl text-center w-full">
            <div className="text-7xl mb-6">❌</div>
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Processing Failed
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              {error}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-lg font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Start Over
            </button>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="flex flex-col items-center justify-center w-full max-w-lg px-4">
        {/* Processing Container */}
        <div className="bg-white bg-opacity-95 px-16 py-20 rounded-3xl shadow-2xl text-center w-full">
          {/* Spinner */}
          <div className="flex justify-center mb-8">
            <div
              className="w-40 h-40 border-8 border-gray-300 border-t-emerald-600 border-r-red-600 rounded-full animate-spin"
              style={{
                borderTop: '8px solid #00732F',
                borderRight: '8px solid #FF0000',
                borderBottom: '8px solid #f3f3f3',
                borderLeft: '8px solid #f3f3f3',
              }}
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-emerald-600 mb-6">
            Creating Your Video
          </h1>

          {/* Progress Bar */}
          <div className="w-full bg-gray-300 rounded-full h-4 mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-600 to-red-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Progress Text */}
          <p className="text-2xl font-bold text-gray-800 mb-4">
            {Math.floor(Math.min(progress, 100))}%
          </p>

          {/* Processing Message */}
          <p className="text-lg text-gray-700 min-h-12 mb-8">
            {currentMessage}
          </p>

          {/* Processing Steps */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <div className="space-y-3 text-left">
              {/* Step 1 - Image */}
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all ${currentStatus === 'completed' || currentStatus === 'video'
                    ? 'bg-emerald-600 text-white'
                    : currentStatus === 'image'
                      ? 'bg-emerald-400 text-white animate-pulse'
                      : 'bg-gray-300 text-gray-600'
                    }`}
                >
                  {currentStatus === 'completed' || currentStatus === 'video' ? '✓' : '1'}
                </div>
                <span
                  className={`text-base font-semibold ${currentStatus === 'completed' || currentStatus === 'video'
                    ? 'text-emerald-600'
                    : currentStatus === 'image'
                      ? 'text-emerald-500'
                      : 'text-gray-700'
                    }`}
                >
                  Processing your face
                </span>
              </div>

              {/* Step 2 - Video */}
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all ${currentStatus === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : currentStatus === 'video'
                      ? 'bg-emerald-400 text-white animate-pulse'
                      : 'bg-gray-300 text-gray-600'
                    }`}
                >
                  {currentStatus === 'completed' ? '✓' : '2'}
                </div>
                <span
                  className={`text-base font-semibold ${currentStatus === 'completed'
                    ? 'text-emerald-600'
                    : currentStatus === 'video'
                      ? 'text-emerald-500'
                      : 'text-gray-700'
                    }`}
                >
                  Generating video
                </span>
              </div>

              {/* Step 3 - Finalize */}
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all ${currentStatus === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                    }`}
                >
                  {currentStatus === 'completed' ? '✓' : '3'}
                </div>
                <span
                  className={`text-base font-semibold ${currentStatus === 'completed' ? 'text-emerald-600' : 'text-gray-700'
                    }`}
                >
                  Finalizing
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Note */}
        <div className="mt-8 text-center text-white max-w-lg">
          <p className="text-sm opacity-90">
            Your personalized video is being created. This may take 1-3 minutes.
          </p>
        </div>
      </div>
    </BackgroundWrapper>
  );
}