/**
 * Unified Background Wrapper
 * 
 * This component provides the consistent UAE-themed background
 * used across all screens in the application.
 */

interface BackgroundWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export default function BackgroundWrapper({
    children,
    className = ''
}: BackgroundWrapperProps) {
    return (
        <div className={`flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-600 via-black to-red-600 font-sans ${className}`}>
            {children}
        </div>
    );
}
