'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/app/store/kioskStore';
import BackgroundWrapper from '@/app/components/BackgroundWrapper';
import { getQRCodeUrl, downloadQRCode } from '@/app/lib/api';

export default function QRCode() {
    const router = useRouter();
    const { jobId, videoUrl, resetStore } = useKioskStore();

    useEffect(() => {
        if (!jobId || !videoUrl) {
            router.push('/avatar-selection');
        }
    }, [jobId, videoUrl, router]);

    const handleDownloadVideo = () => {
        if (!videoUrl) return;

        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `uae-anthem-${jobId}.mp4`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleSaveQR = async () => {
        if (!jobId) return;

        try {
            await downloadQRCode(jobId);
        } catch (error) {
            console.error('Failed to download QR code:', error);
            alert('Failed to download QR code. Please try again.');
        }
    };

    const handleFinish = () => {
        resetStore();
        router.push('/');
    };

    if (!jobId || !videoUrl) {
        return null;
    }

    const qrUrl = getQRCodeUrl(jobId);

    return (
        <BackgroundWrapper>
            <div className="flex flex-col items-center justify-center w-full max-w-2xl px-4 py-8">
                <div className="bg-white bg-opacity-95 px-12 py-16 rounded-3xl shadow-2xl w-full text-center">
                    {/* Title */}
                    <h1 className="text-4xl font-bold text-emerald-600 mb-2">
                        Scan to Download
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Your personalized video is ready!
                    </p>

                    {/* QR Code */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-emerald-600">
                            <img
                                src={qrUrl}
                                alt="QR Code to download video"
                                width={300}
                                height={300}
                                className="rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-emerald-50 border-2 border-emerald-600 rounded-lg p-6 mb-8">
                        <p className="text-lg font-semibold text-emerald-600 mb-2">
                            📱 Scan with your phone
                        </p>
                        <p className="text-gray-700">
                            Use your phone's camera to scan the QR code above to download the video directly to your device.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <button
                            onClick={handleDownloadVideo}
                            className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-green-500/60 flex items-center justify-center gap-2"
                        >
                            <span>📥</span>
                            <span>Download Video</span>
                        </button>

                        <button
                            onClick={handleSaveQR}
                            className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-blue-500/60 flex items-center justify-center gap-2"
                        >
                            <span>💾</span>
                            <span>Save QR Code</span>
                        </button>

                        <button
                            onClick={handleFinish}
                            className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-lg font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-emerald-600/60"
                        >
                            Finish & Start Over
                        </button>
                    </div>

                    {/* Thank You Message */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-xl font-semibold text-gray-800 mb-2">
                            Thank you for participating! 🇦🇪
                        </p>
                        <p className="text-sm text-gray-600">
                            UAE National Anthem AI Experience
                        </p>
                    </div>
                </div>
            </div>
        </BackgroundWrapper>
    );
}
