'use client';
import { useRouter } from 'next/navigation';
import BackgroundWrapper from '@/app/components/BackgroundWrapper';

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/avatar-selection');
  };

  return (
    <BackgroundWrapper>
      <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-8 md:px-16 py-8 sm:py-16 md:py-32">
        <div className="flex flex-col items-center justify-center text-center bg-white bg-opacity-95 px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-24 rounded-3xl shadow-2xl max-w-xs sm:max-w-xl md:max-w-2xl w-full backdrop-blur-sm">
          {/* UAE Logo */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-emerald-600 to-red-600 rounded-full flex items-center justify-center mb-6 sm:mb-7 md:mb-8 animate-pulse text-4xl sm:text-5xl md:text-6xl">
            🇦🇪
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-600 mb-2 sm:mb-3 md:mb-4">
            UAE National Anthem
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-600 mb-6 sm:mb-8 md:mb-10">
            AI Experience
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-xl md:text-2xl text-gray-800 mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2">
            Create your personalized UAE National Anthem video with AI!
          </p>

          {/* Primary Button */}
          <button
            onClick={handleStart}
            className="px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-lg sm:text-xl md:text-2xl font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-emerald-600/60"
          >
            Start Experience
          </button>
        </div>
      </main>
    </BackgroundWrapper>
  );
}
