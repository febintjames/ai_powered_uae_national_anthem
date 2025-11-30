'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/app/store/kioskStore';
import { checkJobStatus } from '@/app/lib/api';

interface PuzzlePiece {
    id: number;
    color: string;
    slotIndex: number;
    label: string;
    shape: string;
}

export default function FlagPuzzle() {
    const router = useRouter();
    // const { userName, mobile } = useKioskStore(); // Removed as they are not in store
    const userName = 'Guest';
    const mobile = 'N/A';

    const { jobId, setVideoUrl, setQrUrl, setProcessingStatus, setErrorMessage, videoUrl } = useKioskStore();

    const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
    const [slots, setSlots] = useState<(PuzzlePiece | null)[]>([]);
    const [completedPieces, setCompletedPieces] = useState(0);
    const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null);
    const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [wrongAttempt, setWrongAttempt] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [spreadingPiece, setSpreadingPiece] = useState<number | null>(null);

    const totalPieces = 16;

    // All pieces now have same bounding box (0,0 to 100,100) for consistent size
    const pieceShapes = {
        // Red stripe pieces (left vertical bar - 4 pieces)
        R1: 'M 10,10 L 90,10 L 90,30 Q 70,35 50,30 Q 30,25 10,30 Z',
        R2: 'M 10,30 Q 30,25 50,30 Q 70,35 90,30 L 90,55 Q 70,60 50,55 Q 30,50 10,55 Z',
        R3: 'M 10,55 Q 30,50 50,55 Q 70,60 90,55 L 90,75 Q 70,80 50,75 Q 30,70 10,75 Z',
        R4: 'M 10,75 Q 30,70 50,75 Q 70,80 90,75 L 90,90 L 10,90 Z',

        // Green stripe pieces (top horizontal - 4 pieces)
        G1: 'M 10,10 L 32,10 Q 35,25 32,40 L 10,40 Z',
        G2: 'M 32,10 Q 35,25 32,40 L 54,40 Q 51,25 54,10 Z',
        G3: 'M 54,10 Q 51,25 54,40 L 76,40 Q 73,25 76,10 Z',
        G4: 'M 76,10 Q 73,25 76,40 L 90,40 L 90,10 Z',

        // White stripe pieces (middle horizontal - 4 pieces)
        W1: 'M 10,40 L 32,40 Q 35,55 32,70 L 10,70 Z',
        W2: 'M 32,40 Q 35,55 32,70 L 54,70 Q 51,55 54,40 Z',
        W3: 'M 54,40 Q 51,55 54,70 L 76,70 Q 73,55 76,40 Z',
        W4: 'M 76,40 Q 73,55 76,70 L 90,70 L 90,40 Z',

        // Black stripe pieces (bottom horizontal - 4 pieces)
        B1: 'M 10,70 L 32,70 Q 35,80 32,90 L 10,90 Z',
        B2: 'M 32,70 Q 35,80 32,90 L 54,90 Q 51,80 54,70 Z',
        B3: 'M 54,70 Q 51,80 54,90 L 76,90 Q 73,80 76,70 Z',
        B4: 'M 76,70 Q 73,80 76,90 L 90,90 L 90,70 Z',
    };

    useEffect(() => {
        initializePuzzle();
    }, []);

    // Polling for video status
    useEffect(() => {
        if (!jobId) return;

        let interval: NodeJS.Timeout;

        const pollStatus = async () => {
            try {
                const status = await checkJobStatus(jobId);
                setProcessingStatus(status.status);

                if (status.status === 'completed') {
                    setVideoUrl(status.video_url || '');
                    setQrUrl(status.qr_url || '');
                    clearInterval(interval);
                } else if (status.status === 'failed') {
                    setErrorMessage(status.error || 'Video generation failed');
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        };

        // Poll every 2 seconds
        interval = setInterval(pollStatus, 2000);
        pollStatus(); // Initial check

        return () => clearInterval(interval);
    }, [jobId, setProcessingStatus, setVideoUrl, setQrUrl, setErrorMessage]);

    // Effect to handle redirection when puzzle is completed
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                router.push('/processing');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess, router]);

    const initializePuzzle = () => {
        const initialPieces: PuzzlePiece[] = [
            // Red stripe pieces (4 pieces)
            { id: 0, color: '#FF0000', slotIndex: 0, label: 'R1', shape: pieceShapes.R1 },
            { id: 1, color: '#FF0000', slotIndex: 1, label: 'R2', shape: pieceShapes.R2 },
            { id: 2, color: '#FF0000', slotIndex: 2, label: 'R3', shape: pieceShapes.R3 },
            { id: 3, color: '#FF0000', slotIndex: 3, label: 'R4', shape: pieceShapes.R4 },

            // Green stripe pieces (4 pieces)
            { id: 4, color: '#00732F', slotIndex: 4, label: 'G1', shape: pieceShapes.G1 },
            { id: 5, color: '#00732F', slotIndex: 5, label: 'G2', shape: pieceShapes.G2 },
            { id: 6, color: '#00732F', slotIndex: 6, label: 'G3', shape: pieceShapes.G3 },
            { id: 7, color: '#00732F', slotIndex: 7, label: 'G4', shape: pieceShapes.G4 },

            // White stripe pieces (4 pieces)
            { id: 8, color: '#FFFFFF', slotIndex: 8, label: 'W1', shape: pieceShapes.W1 },
            { id: 9, color: '#FFFFFF', slotIndex: 9, label: 'W2', shape: pieceShapes.W2 },
            { id: 10, color: '#FFFFFF', slotIndex: 10, label: 'W3', shape: pieceShapes.W3 },
            { id: 11, color: '#FFFFFF', slotIndex: 11, label: 'W4', shape: pieceShapes.W4 },

            // Black stripe pieces (4 pieces)
            { id: 12, color: '#000000', slotIndex: 12, label: 'B1', shape: pieceShapes.B1 },
            { id: 13, color: '#000000', slotIndex: 13, label: 'B2', shape: pieceShapes.B2 },
            { id: 14, color: '#000000', slotIndex: 14, label: 'B3', shape: pieceShapes.B3 },
            { id: 15, color: '#000000', slotIndex: 15, label: 'B4', shape: pieceShapes.B4 },
        ];

        const shuffled = [...initialPieces].sort(() => Math.random() - 0.5);
        setPieces(shuffled);
        setSlots(Array(totalPieces).fill(null));
    };

    const handleDragStart = (piece: PuzzlePiece) => {
        setDraggedPiece(piece);
        setIsDragging(true);
        setSpreadingPiece(piece.id);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
        e.preventDefault();
        setHoveredSlot(slotIndex);
    };

    const handleDragLeave = () => {
        setHoveredSlot(null);
    };

    const handleDrop = (slotIndex: number) => {
        if (!draggedPiece) return;

        if (draggedPiece.slotIndex === slotIndex) {
            const newSlots = [...slots];
            newSlots[slotIndex] = draggedPiece;
            setSlots(newSlots);

            const newPieces = pieces.filter((p) => p.id !== draggedPiece.id);
            setPieces(newPieces);

            const newCompletedCount = completedPieces + 1;
            setCompletedPieces(newCompletedCount);

            // Contract animation before placing
            setTimeout(() => {
                setSpreadingPiece(null);
            }, 300);

            if (newCompletedCount === totalPieces) {
                setTimeout(() => {
                    setShowSuccess(true);
                    // Redirection is now handled by the useEffect that watches showSuccess and videoUrl
                }, 500);
            }
        } else {
            setWrongAttempt(slotIndex);
            setTimeout(() => {
                setWrongAttempt(null);
                setSpreadingPiece(null);
            }, 500);
        }

        setDraggedPiece(null);
        setHoveredSlot(null);
        setIsDragging(false);
    };

    const renderSlot = (slotIndex: number) => {
        const slot = slots[slotIndex];
        const isOccupied = slot !== null;
        const isHovered = hoveredSlot === slotIndex;
        const isWrong = wrongAttempt === slotIndex;
        const isCorrectSlot = draggedPiece && draggedPiece.slotIndex === slotIndex;

        return (
            <div
                key={slotIndex}
                className={`relative border transition-all duration-300 ${isWrong ? 'animate-shake' : ''
                    } ${isHovered && isCorrectSlot ? 'animate-pulse-glow' : ''}`}
                style={{
                    backgroundColor: isOccupied && slot ? slot.color : '#f3f4f6',
                    borderColor: isHovered ? (isCorrectSlot ? '#10b981' : '#ef4444') : '#d1d5db',
                    borderWidth: isHovered ? '3px' : '1px',
                    boxShadow: isHovered && isCorrectSlot ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none',
                }}
                onDragOver={(e) => handleDragOver(e, slotIndex)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(slotIndex)}
            >
                {!isOccupied && isHovered && isCorrectSlot && (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-500 bg-opacity-20 animate-fade-in">
                        <span className="text-4xl animate-bounce">✓</span>
                    </div>
                )}
                {!isOccupied && isHovered && !isCorrectSlot && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-20 animate-fade-in">
                        <span className="text-4xl">✗</span>
                    </div>
                )}
                {isOccupied && slot && (
                    <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <path
                                d={slot.shape}
                                fill={slot.color}
                                stroke="rgba(0,0,0,0.2)"
                                strokeWidth="1"
                            />
                        </svg>
                        <span className={`absolute text-3xl ${slot.color === '#FFFFFF' ? 'text-gray-600' : 'text-white'} drop-shadow-lg font-bold`}>
                            {slot.slotIndex + 1}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-600 via-black to-red-600 font-sans px-4 py-8">
            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl p-12 text-center max-w-md animate-scale-in">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold text-emerald-600 mb-4">
                            Excellent Work!
                        </h2>
                        <p className="text-gray-700 text-lg">
                            You completed the UAE Flag puzzle!
                            <br />
                            Proceeding to processing...
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col items-center justify-center w-full max-w-6xl">
                <div className="bg-white bg-opacity-95 px-12 py-16 rounded-3xl shadow-2xl w-full">
                    {/* Title */}
                    <h1 className="text-4xl font-bold text-emerald-600 mb-2 text-center">
                        Complete the UAE Flag
                    </h1>
                    <p className="text-center text-gray-600 mb-6 text-lg">
                        Drag and drop the pieces to complete the flag
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Progress</span>
                            <span className="text-sm font-bold text-emerald-600">
                                {completedPieces} / {totalPieces} pieces
                            </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-emerald-600 to-red-600 h-full transition-all duration-500 ease-out"
                                style={{ width: `${(completedPieces / totalPieces) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Flag Grid - UAE Flag Layout */}
                    <div className="relative bg-gray-100 rounded-2xl shadow-lg mb-8 border-4 border-gray-300 overflow-hidden">
                        <div className="aspect-[2/1] relative">
                            {/* Red vertical bar (left side) - 4 slots */}
                            <div className="absolute left-0 top-0 w-1/4 h-full grid grid-rows-4">
                                {[0, 1, 2, 3].map((slotIndex) => renderSlot(slotIndex))}
                            </div>

                            {/* Right side horizontal stripes */}
                            <div className="absolute left-1/4 top-0 w-3/4 h-full grid grid-rows-3">
                                {/* Green stripe (top) - 4 slots */}
                                <div className="grid grid-cols-4">
                                    {[4, 5, 6, 7].map((slotIndex) => renderSlot(slotIndex))}
                                </div>

                                {/* White stripe (middle) - 4 slots */}
                                <div className="grid grid-cols-4">
                                    {[8, 9, 10, 11].map((slotIndex) => renderSlot(slotIndex))}
                                </div>

                                {/* Black stripe (bottom) - 4 slots */}
                                <div className="grid grid-cols-4">
                                    {[12, 13, 14, 15].map((slotIndex) => renderSlot(slotIndex))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Available Pieces */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                            Available Pieces ({pieces.length} remaining)
                        </h3>

                        {pieces.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600 text-xl font-semibold">All pieces placed! 🎯</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-6 max-w-4xl mx-auto">
                                {pieces.map((piece) => (
                                    <div
                                        key={piece.id}
                                        draggable
                                        onDragStart={() => handleDragStart(piece)}
                                        onDragEnd={handleDragEnd}
                                        className={`aspect-square cursor-move hover:scale-110 transition-all duration-200 active:scale-95 p-2 relative ${draggedPiece?.id === piece.id ? 'opacity-50 scale-90' : 'opacity-100'
                                            }`}
                                        style={{
                                            minHeight: '120px',
                                        }}
                                    >
                                        {/* Color spreading effect */}
                                        {spreadingPiece === piece.id && (
                                            <>
                                                <div
                                                    className="absolute inset-0 rounded-full animate-color-spread-1"
                                                    style={{
                                                        backgroundColor: piece.color,
                                                        opacity: 0.3,
                                                    }}
                                                />
                                                <div
                                                    className="absolute inset-0 rounded-full animate-color-spread-2"
                                                    style={{
                                                        backgroundColor: piece.color,
                                                        opacity: 0.2,
                                                    }}
                                                />
                                                <div
                                                    className="absolute inset-0 rounded-full animate-color-spread-3"
                                                    style={{
                                                        backgroundColor: piece.color,
                                                        opacity: 0.1,
                                                    }}
                                                />
                                            </>
                                        )}

                                        <svg
                                            viewBox="0 0 100 100"
                                            className="w-full h-full drop-shadow-2xl relative z-10"
                                            preserveAspectRatio="xMidYMid meet"
                                            style={{
                                                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                                            }}
                                        >
                                            <path
                                                d={piece.shape}
                                                fill={piece.color}
                                                stroke={piece.color === '#FFFFFF' ? '#6b7280' : 'rgba(0,0,0,0.4)'}
                                                strokeWidth="3"
                                            />
                                            <text
                                                x="50"
                                                y="55"
                                                textAnchor="middle"
                                                fontSize="32"
                                                fontWeight="bold"
                                                fill={piece.color === '#FFFFFF' ? '#4b5563' : 'white'}
                                                style={{
                                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                                                }}
                                            >
                                                {piece.slotIndex + 1}
                                            </text>
                                        </svg>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Instruction Note */}
                <div className="mt-6 text-center text-white max-w-2xl">
                    <p className="text-base opacity-90 font-medium">
                        💡 Tip: Match the numbers on the pieces to their corresponding positions in the flag
                    </p>
                </div>
            </div>

            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes scale-in {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
          }
          50% { 
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.8);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 1s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce {
          animation: bounce 0.5s ease-in-out infinite;
        }
        @keyframes color-spread-1 {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        @keyframes color-spread-2 {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
        @keyframes color-spread-3 {
          0% {
            transform: scale(1);
            opacity: 0.1;
          }
          100% {
            transform: scale(3.5);
            opacity: 0;
          }
        }
        .animate-color-spread-1 {
          animation: color-spread-1 1.5s ease-out infinite;
        }
        .animate-color-spread-2 {
          animation: color-spread-2 1.5s ease-out 0.3s infinite;
        }
        .animate-color-spread-3 {
          animation: color-spread-3 1.5s ease-out 0.6s infinite;
        }
      `}</style>
        </div>
    );
}
