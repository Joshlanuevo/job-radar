import { useState, type FormEvent } from "react";
import { analyzeJob, ApiError, type Job } from "../api";

interface Props {
    onAdded: (job: Job) => void;
}

export function AddJobForm({ onAdded }: Props) {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!text.trim()) return;

        setSubmitting(true);
        setError(null);

        try {
            const job = await analyzeJob(text);
            onAdded(job);
            setText('');
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) setError('You already saved this post.');
            else if (err instanceof ApiError && err.status === 502) setError('AI service failed. Try again.');
            else setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-2">
            <label htmlFor="job-text" className="font-semibold">Paste a job post</label>
            <textarea
                id="job-text"
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the full post from LinkedIn, JobStreet or a Facebook group…"
                disabled={submitting}
                className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-slate-900
                 focus:outline-2 focus:outline-teal-600 disabled:opacity-60
                 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="justify-self-start rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white
                 hover:bg-teal-800 disabled:cursor-default disabled:opacity-50"
            >
                {submitting ? 'Analyzing…' : 'Analyze job'}
            </button>
        </form>
    );
}