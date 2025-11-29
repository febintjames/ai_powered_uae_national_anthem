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
        // Redirect if no avatar type selected
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

            // Draw the image (mirrored)
            context.scale(-1, 1);
            context.drawImage(videoRef.current, -canvasRef.current.width, 0);
            context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

            // Convert to blob
            const blob = await new Promise<Blob | null>((resolve) => {
                canvasRef.current?.toBlob(resolve, 'image/jpeg', 0.95);
            });

            if (!blob) {
                throw new Error('Failed to create image blob');
            }

            // Store captured image
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage(imageUrl);

            // Stop camera
            stopCamera();

            // Create job and load quiz in parallel
            console.log('Creating video generation job...');
            const { job_id } = await createJob(blob, avatarType);
            console.log('Job created:', job_id);
            setJobId(job_id);

            console.log('Loading quiz questions...');
            const { questions, key } = await getQuestions(10, job_id);
            console.log('Quiz loaded:', questions.length, 'questions');
            setQuizQuestions(questions, key);

            // Navigate to quiz
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
        return null; // Will redirect in useEffect
    }

    return (
        <BackgroundWrapper>
            <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
                {/* Title */}
                <h1 className="text-4xl font-bold text-white text-center z-10 drop-shadow-md">
                    Position Your Face
                </h1>

                {/* Processing Overlay */}
                {processing && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white rounded-3xl px-16 py-12 text-center">
                            <div className="w-16 h-16 border-4 border-gray-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6" />
                            <p className="text-2xl font-bold text-emerald-600 mb-2">
                                Starting Video Generation...
                            </p>
                            <p className="text-gray-600">
                                Please wait while we process your photo
                            </p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500 text-white px-8 py-4 rounded-lg text-center max-w-2xl z-10">
                        <p className="text-lg font-semibold">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="mt-4 px-6 py-2 bg-white text-red-600 font-bold rounded-full hover:bg-gray-100 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Camera Container */}
                {!error && (
                    <>
                        <div className="relative w-full max-w-[500px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />

                            {/* Face Overlay Guide */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[70%] border-4 border-dashed border-emerald-400/80 rounded-[50%] opacity-80 pointer-events-none box-border shadow-[0_0_15px_rgba(52,211,153,0.5)]" />

                            {/* Loading Indicator */}
                            {loading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-12 h-12 border-4 border-gray-300 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-white text-lg font-semibold">
                                            Initializing Camera...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Camera Tips */}
                        <div className="bg-white/95 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-xl w-full max-w-[500px] z-10">
                            <h3 className="text-xl font-bold text-emerald-600 mb-4">
                                Camera Tips
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <span className="text-emerald-600 font-bold mr-3 text-lg">✓</span>
                                    <span className="text-gray-700">
                                        Position your face in the center of the oval
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-600 font-bold mr-3 text-lg">✓</span>
                                    <span className="text-gray-700">
                                        Ensure good lighting on your face
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-600 font-bold mr-3 text-lg">✓</span>
                                    <span className="text-gray-700">
                                        Look directly at the camera
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-600 font-bold mr-3 text-lg">✓</span>
                                    <span className="text-gray-700">
                                        Selected avatar: <strong>{avatarType}</strong>
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Button Group */}
                        <div className="flex gap-4 w-full max-w-[500px] z-10 mt-2">
                            <button
                                onClick={handleBack}
                                disabled={processing}
                                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white text-lg font-bold rounded-full uppercase tracking-wider transition-all duration-300 shadow-lg disabled:cursor-not-allowed"
                            >
                                Back
                            </button>
                            <button
                                onClick={capturePhoto}
                                disabled={!cameraActive || loading || processing}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-emerald-600/60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {processing ? 'Processing...' : 'Capture Photo'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Hidden Canvas for Image Capture */}
            <canvas
                ref={canvasRef}
                className="hidden"
            />
        </BackgroundWrapper>
    );
}