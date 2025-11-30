'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/app/store/kioskStore';
import BackgroundWrapper from '@/app/components/BackgroundWrapper';
import type { AvatarType } from '@/app/lib/api';
import Image from 'next/image';

interface AvatarOption {
    type: AvatarType;
    imagePath: string;
}

const avatarOptions: AvatarOption[] = [
    {
        type: 'Boy',
        imagePath: '/avatars/boy.jpg',
    },
    {
        type: 'Girl',
        imagePath: '/avatars/girl.jpg',
    },
    {
        type: 'Male',
        imagePath: '/avatars/male.jpg',
    },
    {
        type: 'Female',
        imagePath: '/avatars/female.jpg',
    },
];

export default function AvatarSelection() {
    const router = useRouter();
    const { setAvatarType } = useKioskStore();
    const [selected, setSelected] = useState<AvatarType | null>(null);

    const handleSelect = (type: AvatarType) => {
        setSelected(type);
    };

    const handleNext = () => {
        if (selected) {
            setAvatarType(selected);
            router.push('/camera');
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <BackgroundWrapper>
            <div className="flex flex-col items-center justify-center w-full px-4 py-8">
                {/* Main Container */}
                <div className="bg-white bg-opacity-95 px-6 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16 rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-2xl md:max-w-4xl">
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-600 text-center mb-2 sm:mb-4">
                        Choose Your Avatar
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 text-center mb-6 sm:mb-8 md:mb-12">
                        Select the traditional attire style for your video
                    </p>

                    {/* Avatar Grid - Responsive */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12">
                        {avatarOptions.map((avatar) => (
                            <button
                                key={avatar.type}
                                onClick={() => handleSelect(avatar.type)}
                                className={`
                  relative p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border-4 transition-all duration-300
                  hover:shadow-xl hover:-translate-y-1
                  ${selected === avatar.type
                                        ? 'border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-600/30'
                                        : 'border-gray-300 bg-white hover:border-emerald-400'
                                    }
                `}
                            >
                                {/* Selection Checkmark */}
                                {selected === avatar.type && (
                                    <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold z-10 text-sm sm:text-lg md:text-xl">
                                        ✓
                                    </div>
                                )}

                                {/* Avatar Image - No Text */}
                                <div className="relative w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-black">
                                    <Image
                                        src={avatar.imagePath}
                                        alt={`Avatar ${avatar.type}`}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Info Box */}
                    <div className="bg-emerald-50 border-2 border-emerald-600 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 md:mb-8">
                        <p className="text-xs sm:text-sm text-gray-700 text-center">
                            <span className="font-semibold text-emerald-600">Note:</span>{' '}
                            Your generated video will feature you wearing the selected traditional UAE attire while singing the national anthem.
                        </p>
                    </div>

                    {/* Button Group */}
                    <div className="flex gap-3 sm:gap-4">
                        <button
                            onClick={handleBack}
                            className="flex-1 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gray-600 hover:bg-gray-700 text-white text-sm sm:text-base md:text-lg font-bold rounded-full uppercase tracking-wider transition-all duration-300 shadow-lg"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!selected}
                            className="flex-1 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm sm:text-base md:text-lg font-bold rounded-full uppercase tracking-wider hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-emerald-600/60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </BackgroundWrapper>
    );
}
