export type WorkSetup = 'remote' | 'hybrid' | 'onsite';
export type Shift = 'day' | 'night' | 'unknown';
export type JobStatus = 'new' | 'applied' | 'interview' | 'rejected' | 'offer';

export interface Job {
    _id: string;
    source: 'paste' | 'screenshot' | 'gmail';
    rawText: string;
    url: string | null;
    title: string | null;
    company: string | null;
    location: string | null;
    workSetup: WorkSetup | null;
    shift: Shift;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
    yearsRequired: number | null;
    requiredSkills: string[];
    niceToHave: string[];
    score: number | null;
    reasons: string[];
    redFlags: string[];
    status: JobStatus;
    notes: string;
    appliedAt: string | null;
    createdAt: string;
}

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...init,
    });

    if (!res.ok) {
        // Nest errors look like { statusCode, message, error }; message can be an array
        const body = await res.json().catch(() => null);
        const msg = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
        throw new ApiError(res.status, msg ?? res.statusText);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export const getJobs = () => request<Job[]>('/jobs');

export const analyzeJob = (text: string, url?: string) => 
    request<Job>('/jobs/analyze', {
        method: 'POST',
        body: JSON.stringify({ text, url: url || undefined }),
    });
