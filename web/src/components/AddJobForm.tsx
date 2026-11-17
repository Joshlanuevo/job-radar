import { useState, type ChangeEvent, type ClipboardEvent, type FormEvent } from 'react';
import { analyzeImage, analyzeJob, ApiError, type Job } from '../api';

interface Props {
    onAdded: (job: Job) => void;
}

function errorMessage(err: unknown) {
    if (err instanceof ApiError) {
        if (err.status === 409) return 'You already saved this post.';
        if (err.status === 413) return 'Image is too large (max 3.5 MB).';
        if (err.status === 415) return 'Use a PNG, JPEG or WebP image.';
        if (err.status === 502) return 'AI service failed. Try again.';
    }
    return err instanceof Error ? err.message : 'Something went wrong.';
}

export function AddJobForm({ onAdded }: Props) {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(action: () => Promise<Job>) {
        setSubmitting(true);
        setError(null);
        try {
            onAdded(await action());
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!text.trim()) return;
        submit(async () => {
            const job = await analyzeJob(text);
            setText('');
            return job;
        });
    }

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = ''; // so picking the same file again still fires onChange
        if (file) submit(() => analyzeImage(file));
    }

    // Ctrl+V a screenshot straight into the textarea
    function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
        const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith('image/'));
        if (!file) return; // normal text paste
        e.preventDefault();
        submit(() => analyzeImage(file));
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-2">
            <label htmlFor="job-text" className="font-semibold">Paste a job post</label>
            <textarea
                id="job-text"
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onPaste={handlePaste}
                placeholder="Paste the post text, or paste a screenshot (Ctrl+V)…"
                disabled={submitting}
                className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-slate-900
                           focus:outline-2 focus:outline-teal-600 disabled:opacity-60
                           dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={submitting || !text.trim()}
                    className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white
                               hover:bg-teal-800 disabled:cursor-default disabled:opacity-50"
                >
                    {submitting ? 'Analyzing…' : 'Analyze job'}
                </button>
                <label
                    className={`cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-semibold
                                hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800
                                ${submitting ? 'pointer-events-none opacity-50' : ''}`}
                >
                    Upload screenshot
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFile}
                        disabled={submitting}
                        className="hidden"
                    />
                </label>
            </div>
        </form>
    );
}
