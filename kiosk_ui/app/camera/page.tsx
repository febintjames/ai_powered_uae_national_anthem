'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/app/store/kioskStore';
import BackgroundWrapper from '@/app/components/BackgroundWrapper';
import { createJob, getQuestions } from '@/app/lib/api';

export default function Camera() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const { avatarType, setCapturedImage, setJobId, setQuizQuestions } = useKioskStore();

    const [cameraActive, setCameraActive] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const initCamera = async () => {
        try {
            setLoading(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraActive(true);
                setError('');
            }
        } catch (err) {
            setError('Unable to access camera. Please check permissions.');
            console.error('Camera error:', err);
            setCameraActive(false);
        } finally {
            setLoading(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        if (!avatarType) {
            router.push('/avatar-selection');
            return;
        }

        initCamera();
        return () => {
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [avatarType, router]);

    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current || !avatarType) return;

        try {
            setProcessing(true);
            const context = canvasRef.current.getContext('2d');
            if (!context) return;

            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;

            context.scale(-1, 1);
            context.drawImage(videoRef.current, -canvasRef.current.width, 0);
            context.setTransform(1, 0, 0, 1, 0, 0);

            const blob = await new Promise<Blob | null>((resolve) => {
                canvasRef.current?.toBlob(resolve, 'image/jpeg', 0.95);
            });

            if (!blob) {
                throw new Error('Failed to create image blob');
            }

            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage(imageUrl);

            stopCamera();

            console.log('Creating video generation job...');
            const { job_id } = await createJob(blob, avatarType);
            console.log('Job created:', job_id);
            setJobId(job_id);

            console.log('Loading quiz questions...');
            const { questions, key } = await getQuestions(10, job_id);
            console.log('Quiz loaded:', questions.length, 'questions');
            setQuizQuestions(questions, key);

            router.push('/quiz');

        } catch (err) {
            console.error('Capture error:', err);
            setError(err instanceof Error ? err.message : 'Failed to start video generation. Please try again.');
            setProcessing(false);
        }
    };

    const handleBack = () => {
        stopCamera();
        router.back();
    };

    const handleRetry = () => {
        setCameraActive(false);
        setError('');
        initCamera();
    };

    if (!avatarType) {
        return null;
    }

    return (
        <BackgroundWrapper>
            <div className="flex flex-col items-center justify-center min-h-screen px-4 py-6 sm:py-8 gap-4 sm:gap-6">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center z-10 drop-shadow-md">
                    Position Your Face
                </h1>

                {/* Processing Overlay */}
                {processing && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white rounded-3xl px-8 sm:px-12 md:px-16 py-8 sm:py-10 md:py-12 text-center mx-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-4 border-gray-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4 sm:mb-5 md:mb-6" />
                            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mb-2">
                                Starting Video Generation...
                            </p>
                            <p className="text-sm sm:text-base text-gray-600">
                                Please wait while we process your photo
                            </p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-center max-w-xs sm:max-w-md md:max-w-2xl z-10">
                        <p className="text-base sm:text-lg font-semibold">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-white text-red-600 font-bold rounded-full hover:bg-gray-100 transition-colors text-sm sm:text-base"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Camera Container */}
                {!error && (
                    <>
                        <div className="relative w-full max-w-[280px] sm:max-w-[400px] md:max-w-[500px] aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/10">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />

                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[70%] border-3 sm:border-4 border-dashed border-emerald-400/80 rounded-[50%] opacity-80 pointer-events-none box-border shadow-[0_0_15px_rgba(52,211,153,0.5)]" />

                            {loading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-300 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3 sm:mb-4" />
                                        <p className="text-white text-base sm:text-lg font-semibold">
                                            Initializing Camera...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Camera Tips */}
                        <div className="bg-white/95 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl shadow-xl w-full max-w-[280px] sm:max-w-[400px] md:max-w-[500px] z-10">
                            <h3 className="text-lg sm:text-xl font-bold text-emerald-600 mb-3 sm:mb-4">
                                Camera Tips
                            </h3>
                            <ul className="space-y-2 sm:space-y-3">
                                <li className="flex items-start">
                                    <span className="text-emerald-600 font-bold mr-2 sm:mr-3 text-base sm:text-lg">✓</span>
                                    <span className="text-sm sm:text-base text-gray-700">
                                        Position your face in the center of the oval
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-600 font-bold mr-2 sm:mr-3 text-base sm:text-lg">✓</span>
                                    <span className="text-sm sm:text-base text-gray-700">
                                        Ensure good lighting on your face
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-600 font-bold mr-2 sm:mr-3 text-base sm:text-lg">✓</span>
                                    <span className="text-sm sm:text-base text-gray-700">
                                        Look directly at the camera
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-600 font-bold mr-2 sm:mr-3 text-base sm:text-lg">✓</span>
                                    <span className="text-sm sm:text-base text-gray-700">
                                        Selected avatar: <strong>{avatarType}</strong>
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Button Group */}
                        <div className="flex gap-3 sm:gap-4 w-full max-w-[280px] sm:max-w-[400px] md:max-w-[500px] z-10 mt-2">
                            <button
                                onClick={handleBack}
                                disabled={processing}
                                className="flex-1 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm sm:text-base md:text-lg font-bold rounded-full uppercase tracking-wider transition-all duration-300 shadow-lg disabled:cursor-not-allowed"
                            >
                                Back
                            </button>
                            <button
                                onClick={capturePhoto}
                                disabled={!cameraActive || loading || processing}
                                className="flex-1 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm sm:text-base md:text-lg font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-emerald-600/60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {processing ? 'Processing...' : 'Capture Photo'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </BackgroundWrapper>
    );
}