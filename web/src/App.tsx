import { useEffect, useState } from 'react';
import { getJobs, type Job } from './api';
import { AddJobForm } from './components/AddJobForm';
import { JobList } from './components/JobList';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadJobs() {
    try {
      setError(null);
      setJobs(await getJobs());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load jobs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  function handleUpdated(updated: Job) {
    setJobs((prev) => prev.map((j) => (j._id === updated._id ? updated : j)));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto grid max-w-3xl gap-6 px-4 pt-8 pb-16">
        <header>
          <h1 className="text-3xl font-bold">JobRadar</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Paste a job post. AI extracts the details, your profile decides the score.
          </p>
        </header>

        <AddJobForm onAdded={loadJobs} />

        {loading && <p className="text-slate-500">Loading jobs…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error} (is the API running on :3000?)</p>}
        {!loading && !error && <JobList jobs={jobs} onUpdated={handleUpdated} />}
      </main>
    </div>
  );
}
