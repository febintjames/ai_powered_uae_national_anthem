'use client';
import { useRouter } from 'next/navigation';
import BackgroundWrapper from '@/app/components/BackgroundWrapper';

export default function Home() {

  const router = useRouter();

  const handleNav = () => {
    router.push('/avatar-selection');
  };

  return (
    <BackgroundWrapper>
      <main className="flex min-h-screen w-full flex-col items-center justify-center px-16 py-32">
        <div className="flex flex-col items-center justify-center text-center bg-white bg-opacity-95 px-16 py-24 rounded-3xl shadow-2xl max-w-2xl">
          {/* UAE Logo */}
          <div className="w-40 h-40 bg-gradient-to-br from-emerald-600 to-red-600 rounded-full flex items-center justify-center mb-8 animate-pulse text-6xl">
            🇦🇪
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold text-emerald-600 mb-4">
            UAE National Anthem
          </h1>
          <h2 className="text-5xl font-bold text-emerald-600 mb-10">
            AI Experience
          </h2>

          {/* Subtitle */}
          <p className="text-2xl text-gray-800 mb-12 leading-relaxed">
            Create your personalized UAE National Anthem video with AI!
          </p>

          {/* Primary Button */}
          <button onClick={handleNav} className="px-16 py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-2xl font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-emerald-600/60">
            Start Experience
          </button>
        </div>
      </main>
    </BackgroundWrapper>
  );
}
