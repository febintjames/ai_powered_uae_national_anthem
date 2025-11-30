import Image from 'next/image';

export default function Logo() {
    return (
        <div className="absolute top-4 right-4 z-50 animate-fade-in-scale">
            <div className="bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Image
                    src="/aibotics-logo.jpg"
                    alt="Aibotics"
                    width={120}
                    height={30}
                    className="object-contain"
                    priority
                />
            </div>

            <style jsx>{`
                @keyframes fadeInScale {
                    0% {
                        opacity: 0;
                        transform: scale(0.8) translateY(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                .animate-fade-in-scale {
                    animation: fadeInScale 0.6s ease-out;
                }
            `}</style>
        </div>
    );
}
