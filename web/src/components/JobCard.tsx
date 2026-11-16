import { useState, type ChangeEvent } from 'react';
import { updateJob, type Job, type JobStatus } from '../api';

const STATUSES: JobStatus[] = ['new', 'applied', 'interview', 'rejected', 'offer'];

function scoreClasses(score: number | null) {
    if (score === null) return 'border-slate-400 text-slate-500';
    if (score >= 70) return 'border-green-600 text-green-700 dark:border-green-400 dark:text-green-400';
    if (score >= 40) return 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400';
    return 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400';
}

function formatSalary(job: Job) {
    if (job.salaryMin === null && job.salaryMax === null) return null;
    const fmt = (n: number) => n.toLocaleString('en-PH');
    const cur = job.currency ?? '';
    if (job.salaryMin !== null && job.salaryMax !== null && job.salaryMin !== job.salaryMax) {
        return `${cur} ${fmt(job.salaryMin)}–${fmt(job.salaryMax)}`.trim();
    }
    return `${cur} ${fmt((job.salaryMax ?? job.salaryMin)!)}`.trim();
}

export function JobCard({ job, onUpdated }: { job: Job; onUpdated: (job: Job) => void }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleStatus(e: ChangeEvent<HTMLSelectElement>) {
        setSaving(true);
        setError(null);
        try {
            onUpdated(await updateJob(job._id, { status: e.target.value as JobStatus }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update status');
        } finally {
            setSaving(false);
        }
    }

    const salary = formatSalary(job);
    const meta = [job.company, job.location, job.workSetup, job.shift !== 'unknown' ? `${job.shift} shift` : null, salary]
        .filter(Boolean)
        .join(' · ');

    return (
        <article className="grid grid-cols-[56px_1fr] gap-4 rounded-xl border border-slate-200 bg-white p-4
                      dark:border-slate-800 dark:bg-slate-900">
            <div className={`grid size-14 place-items-center rounded-lg border-2 text-xl font-bold tabular-nums ${scoreClasses(job.score)}`}>
                {job.score ?? '–'}
            </div>

            <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[17px] font-semibold">{job.title ?? 'Untitled role'}</h3>
                    <select
                        value={job.status}
                        onChange={handleStatus}
                        disabled={saving}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm capitalize
                   disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800"
                    >
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
                {meta && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{meta}</p>}

                {job.redFlags.length > 0 && (
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {job.redFlags.map((f) => (
                            <li key={f} className="rounded bg-red-50 px-2 py-0.5 text-[13px] text-red-700 dark:bg-red-950 dark:text-red-300">
                                {f}
                            </li>
                        ))}
                    </ul>
                )}
                {job.reasons.length > 0 && (
                    <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">{job.reasons.join(' · ')}</p>
                )}
            </div>
        </article>
    );
}
