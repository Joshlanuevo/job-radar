import { JOB_STATUSES, WORK_SETUPS, type JobFilters, type JobStatus, type WorkSetup } from '../api';

const selectClass =
    'rounded-md border border-slate-300 bg-white px-2 py-1 text-sm capitalize dark:border-slate-700 dark:bg-slate-800';

export function FilterBar({ filters, onChange }: { filters: JobFilters; onChange: (f: JobFilters) => void }) {
    function set<K extends keyof JobFilters>(key: K, value: JobFilters[K]) {
        onChange({ ...filters, [key]: value });
    }

    const hasFilters = Object.values(filters).some((v) => v !== undefined);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <select
                value={filters.status ?? ''}
                onChange={(e) => set('status', (e.target.value || undefined) as JobStatus | undefined)}
                className={selectClass}
            >
                <option value="">All statuses</option>
                {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
                value={filters.workSetup ?? ''}
                onChange={(e) => set('workSetup', (e.target.value || undefined) as WorkSetup | undefined)}
                className={selectClass}
            >
                <option value="">Any setup</option>
                {WORK_SETUPS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>

            <select
                value={filters.minScore ?? ''}
                onChange={(e) => set('minScore', e.target.value ? Number(e.target.value) : undefined)}
                className={selectClass}
            >
                <option value="">Any score</option>
                <option value="40">40+</option>
                <option value="70">70+</option>
            </select>

            <select
                value={filters.sort ?? 'score'}
                onChange={(e) => set('sort', e.target.value === 'newest' ? 'newest' : undefined)}
                className={selectClass}
            >
                <option value="score">Best match</option>
                <option value="newest">Newest</option>
            </select>

            {hasFilters && (
                <button
                    type="button"
                    onClick={() => onChange({})}
                    className="text-sm text-teal-700 hover:underline dark:text-teal-400"
                >
                    Clear
                </button>
            )}
        </div>
    );
}
