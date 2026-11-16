import type { Job } from '../api';
import { JobCard } from './JobCard';

export function JobList({ jobs, onUpdated }: { jobs: Job[]; onUpdated: (job: Job) => void }) {
    if (jobs.length === 0) {
        return <p className="text-slate-500">No jobs yet. Paste a post above to get started.</p>;
    }
    return (
        <div className="grid gap-3">
            {jobs.map((job) => <JobCard key={job._id} job={job} onUpdated={onUpdated} />)}
        </div>
    );
}
