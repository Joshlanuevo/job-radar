import type { Job } from '../api';
import { JobCard } from './JobCard';

export function JobList({ jobs, onUpdated, emptyText }: {
    jobs: Job[];
    onUpdated: (job: Job) => void;
    emptyText: string;
}) {
    if (jobs.length === 0) {
        return <p className="text-slate-500">{emptyText}</p>;
    }
    return (
        <div className="grid gap-3">
            {jobs.map((job) => <JobCard key={job._id} job={job} onUpdated={onUpdated} />)}
        </div>
    );
}
