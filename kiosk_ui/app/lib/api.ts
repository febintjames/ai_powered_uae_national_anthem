/**
 * API Utility Functions for UAE National Anthem Kiosk
 * 
 * This module provides typed API calls to the backend service.
 */

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://40.172.154.249:8000/';

// Types
export interface JobResponse {
    job_id: string;
}

export interface JobStatus {
    status: 'queued' | 'image' | 'video' | 'completed' | 'failed';
    error?: string | null;
    video_url?: string;
    qr_url?: string;
}

export interface Question {
    id: number;
    question: string;
    options: string[];
}

export interface QuestionWithAnswer extends Question {
    answer: number;
}

export interface QuestionsResponse {
    questions: Question[];
    key: QuestionWithAnswer[];
}

export interface QuizResult {
    total: number;
    correct: number;
    score: number;
}

export type AvatarType = 'Male' | 'Female' | 'Boy' | 'Girl';

/**
 * Create a new video generation job
 * @param image - The captured user photo (File or Blob)
 * @param ageGroup - The selected avatar type
 * @param phone - Optional phone number
 * @returns Job ID
 */
export async function createJob(
    image: File | Blob,
    ageGroup: AvatarType,
    phone?: string
): Promise<JobResponse> {
    const formData = new FormData();
    formData.append('image', image, 'photo.jpg');
    formData.append('age_group', ageGroup);
    if (phone) {
        formData.append('phone', phone);
    }

    const response = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || 'Failed to create job');
    }

    return response.json();
}

/**
 * Check the status of a video generation job
 * @param jobId - The job ID to check
 * @returns Current job status
 */
export async function checkJobStatus(jobId: string): Promise<JobStatus> {
    const response = await fetch(`${API_BASE}/api/jobs/${jobId}`);

    if (!response.ok) {
        throw new Error('Failed to check job status');
    }

    return response.json();
}

/**
 * Get quiz questions
 * @param count - Number of questions to retrieve (default: 10)
 * @param seed - Optional seed for deterministic question selection
 * @returns Questions and answer key
 */
export async function getQuestions(
    count: number = 10,
    seed?: string
): Promise<QuestionsResponse> {
    const url = new URL(`${API_BASE}/api/questions`);
    url.searchParams.set('count', count.toString());
    if (seed) {
        url.searchParams.set('seed', seed);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error('Failed to fetch questions');
    }

    return response.json();
}

/**
 * Submit quiz answers for grading
 * @param jobId - The job ID
 * @param key - The answer key from the questions response
 * @param answers - Array of user's selected answer indices
 * @returns Quiz grading result
 */
export async function submitAnswers(
    jobId: string,
    key: QuestionWithAnswer[],
    answers: (number | null)[]
): Promise<QuizResult> {
    const response = await fetch(`${API_BASE}/api/jobs/${jobId}/answers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, answers }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || 'Failed to submit answers');
    }

    return response.json();
}

/**
 * Get the QR code URL for a job
 * @param jobId - The job ID
 * @returns Full URL to the QR code image
 */
export function getQRCodeUrl(jobId: string): string {
    return `${API_BASE}/api/jobs/${jobId}/qr`;
}

/**
 * Download QR code as PNG file
 * @param jobId - The job ID
 */
export async function downloadQRCode(jobId: string): Promise<void> {
    const response = await fetch(getQRCodeUrl(jobId));

    if (!response.ok) {
        throw new Error('Failed to download QR code');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `uae-anthem-qr-${jobId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Check API health status
 * @returns True if API is healthy
 */
export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/healthz`);
        if (!response.ok) return false;

        const data = await response.json();
        return data.ok === true;
    } catch {
        return false;
    }
}

/**
 * Poll job status until completion or failure
 * @param jobId - The job ID
 * @param onStatusChange - Callback for status updates
 * @param intervalMs - Polling interval in milliseconds (default: 2000)
 * @returns Promise that resolves with final status when completed or failed
 */
export async function pollJobStatus(
    jobId: string,
    onStatusChange?: (status: JobStatus) => void,
    intervalMs: number = 2000
): Promise<JobStatus> {
    return new Promise((resolve, reject) => {
        const poll = async () => {
            try {
                const status = await checkJobStatus(jobId);

                if (onStatusChange) {
                    onStatusChange(status);
                }

                if (status.status === 'completed' || status.status === 'failed') {
                    clearInterval(interval);
                    resolve(status);
                }
            } catch (error) {
                clearInterval(interval);
                reject(error);
            }
        };

        // Check immediately
        poll();

        // Then poll at intervals
        const interval = setInterval(poll, intervalMs);
    });
}

export default {
    createJob,
    checkJobStatus,
    getQuestions,
    submitAnswers,
    getQRCodeUrl,
    downloadQRCode,
    checkHealth,
    pollJobStatus,
};
