export type WorkSetup = 'remote' | 'hybrid' | 'onsite';
export type Shift = 'day' | 'night' | 'unknown';
export type JobStatus = 'new' | 'applied' | 'interview' | 'rejected' | 'offer';
export const JOB_STATUSES: JobStatus[] = ['new', 'applied', 'interview', 'rejected', 'offer'];
export const WORK_SETUPS: WorkSetup[] = ['remote', 'hybrid', 'onsite'];

export interface JobFilters {
    status?: JobStatus;
    workSetup?: WorkSetup;
    minScore?: number;
    sort?: 'score' | 'newest';
}

export function filtersToQuery(f: JobFilters): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(f)) {
        if (value !== undefined) params.set(key, String(value));
    }
    return params.toString();
}

// The URL is user input: keep only valid values, or the API answers 400
export function filtersFromQuery(search: string): JobFilters {
    const p = new URLSearchParams(search);
    const f: JobFilters = {};
    const status = p.get('status') as JobStatus;
    if (JOB_STATUSES.includes(status)) f.status = status;
    const workSetup = p.get('workSetup') as WorkSetup;
    if (WORK_SETUPS.includes(workSetup)) f.workSetup = workSetup;
    const minScore = Number(p.get('minScore'));
    if (Number.isInteger(minScore) && minScore > 0 && minScore <= 100) f.minScore = minScore;
    if (p.get('sort') === 'newest') f.sort = 'newest';
    return f;
}

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
        ...init,
        headers: typeof init?.body === 'string' ? { 'Content-Type': 'application/json' } : undefined,
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

export const getJobs = (filters: JobFilters = {}) => {
    const qs = filtersToQuery(filters);
    return request<Job[]>(`/jobs${qs ? `?${qs}` : ''}`);
};

export const analyzeJob = (text: string, url?: string) =>
    request<Job>('/jobs/analyze', {
        method: 'POST',
        body: JSON.stringify({ text, url: url || undefined }),
    });

export const analyzeImage = (file: File) => {
    const form = new FormData();
    form.append('image', file); // same name as FileInterceptor('image')
    return request<Job>('/jobs/analyze-image', { method: 'POST', body: form });
};

export const updateJob = (id: string, patch: { status?: JobStatus; notes?: string }) =>
    request<Job>(`/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
    });