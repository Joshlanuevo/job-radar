import { useEffect, useState } from 'react';
import { filtersFromQuery, filtersToQuery, getJobs, type Job, type JobFilters } from './api';
import { AddJobForm } from './components/AddJobForm';
import { FilterBar } from './components/FilterBar';
import { JobList } from './components/JobList';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>(() => filtersFromQuery(window.location.search));
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const qs = filtersToQuery(filters);
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);

    let ignore = false;
    getJobs(filters)
      .then((data) => {
        if (ignore) return;
        setJobs(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof Error ? err.message : 'Could not load jobs');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [filters, reloadKey]);

  function handleUpdated(updated: Job) {
    setJobs((prev) =>
      filters.status && updated.status !== filters.status
        ? prev.filter((j) => j._id !== updated._id) // no longer matches the filter
        : prev.map((j) => (j._id === updated._id ? updated : j)),
    );
  }

  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto grid max-w-3xl gap-6 px-4 pt-8 pb-16">
        <header>
          <h1 className="text-3xl font-bold">JobRadar</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Paste a job post. AI extracts the details, your profile decides the score.
          </p>
        </header>

        <AddJobForm onAdded={() => setReloadKey((k) => k + 1)} />

        <FilterBar filters={filters} onChange={setFilters} />

        {loading && <p className="text-slate-500">Loading jobs…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error} (is the API running on :3000?)</p>}
        {!loading && !error && (
          <JobList
            jobs={jobs}
            onUpdated={handleUpdated}
            emptyText={hasFilters ? 'No jobs match these filters.' : 'No jobs yet. Paste a post above to get started.'}
          />
        )}
      </main>
    </div>
  );
}
