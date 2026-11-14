import { scoreJob, ScoringJob, ScoringProfile } from './score-job.js';
import { Shift, WorkSetup } from '../jobs/job.enums.js';

const job = (o: Partial<ScoringJob> = {}): ScoringJob => ({
  requiredSkills: ['React', 'Node.js'],
  niceToHave: [],
  yearsRequired: 3,
  salaryMax: 90000,
  currency: 'PHP',
  workSetup: WorkSetup.REMOTE,
  shift: Shift.DAY,
  ...o,
});

const profile = (o: Partial<ScoringProfile> = {}): ScoringProfile => ({
  skills: ['React', 'NodeJS', 'TypeScript'],
  yearsExperience: 3,
  minSalary: 70000,
  acceptsOnsite: false,
  acceptsNightShift: false,
  avoidSkills: ['Angular'],
  ...o,
});

describe('scoreJob', () => {
  it('gives a perfect match a high score with no red flags', () => {
    const r = scoreJob(job(), profile());
    expect(r.score).toBeGreaterThanOrEqual(90);
    expect(r.redFlags).toEqual([]);
  });

  it('flags night shift when not accepted', () => {
    const r = scoreJob(job({ shift: Shift.NIGHT }), profile());
    expect(r.redFlags).toContain('Night shift');
  });

  // TODO (you): write these
  // - matches "Node.js" against "NodeJS" (normalization)
  // - Angular in required skills → red flag + lower score
  // - salaryMax below minSalary → red flag
  // - onsite + acceptsOnsite=false → red flag; acceptsOnsite=true → no flag
  // - yearsRequired 6 vs 3 → red flag
  // - score never goes below 0 (stack every penalty)
  // - USD salary is not compared against PHP minimum
});
