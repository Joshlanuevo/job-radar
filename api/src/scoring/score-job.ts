import { Job } from '../jobs/schemas/job.schema.js';
import { Profile } from '../profile/schemas/profile.schema.js';
import { Shift, WorkSetup } from '../jobs/job.enums.js';

export type ScoringJob = Pick<
  Job,
  'requiredSkills' | 'niceToHave' | 'yearsRequired' | 'salaryMax' | 'currency' | 'workSetup' | 'shift'
>;
export type ScoringProfile = Pick<
  Profile,
  'skills' | 'yearsExperience' | 'minSalary' | 'acceptsOnsite' | 'acceptsNightShift' | 'avoidSkills'
>;
export interface ScoreResult {
  score: number;
  reasons: string[];
  redFlags: string[];
}

// "Node.js", "NodeJS", "node js" → "nodejs"
export const normalizeSkill = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#]/g, '');

export function scoreJob(job: ScoringJob, profile: ScoringProfile): ScoreResult {
  const reasons: string[] = [];
  const redFlags: string[] = [];
  let score = 0;

  const mine = new Set(profile.skills.map(normalizeSkill));
  const avoid = new Set(profile.avoidSkills.map(normalizeSkill));

  // 1. Required skills: up to 50
  if (job.requiredSkills.length === 0) {
    score += 25;
    reasons.push('No required skills listed');
  } else {
    const matched = job.requiredSkills.filter((s) => mine.has(normalizeSkill(s)));
    score += Math.round((matched.length / job.requiredSkills.length) * 50);
    reasons.push(`Matches ${matched.length}/${job.requiredSkills.length} required skills`);
  }

  // 2. Nice-to-have: up to 10
  const niceMatched = job.niceToHave.filter((s) => mine.has(normalizeSkill(s)));
  if (niceMatched.length > 0) {
    score += Math.min(10, niceMatched.length * 5);
    reasons.push(`Has nice-to-have: ${niceMatched.join(', ')}`);
  }

  // 3. Years: up to 15
  if (job.yearsRequired === null || job.yearsRequired <= profile.yearsExperience) {
    score += 15;
  } else if (job.yearsRequired - profile.yearsExperience <= 1) {
    score += 8;
    reasons.push(`Asks ${job.yearsRequired} yrs, you have ${profile.yearsExperience}`);
  } else {
    redFlags.push(`Needs ${job.yearsRequired} yrs experience`);
  }

  // 4. Salary: up to 15 (only compares PHP)
  const comparable = job.currency === null || job.currency === 'PHP';
  if (job.salaryMax === null || profile.minSalary === null || !comparable) {
    score += 8;
    if (job.salaryMax === null) reasons.push('Salary not stated');
  } else if (job.salaryMax >= profile.minSalary) {
    score += 15;
    reasons.push('Salary meets your minimum');
  } else {
    redFlags.push(`Max salary ${job.salaryMax} is below your ${profile.minSalary}`);
  }

  // 5. Work setup: up to 10
  if (job.workSetup === WorkSetup.REMOTE || job.workSetup === WorkSetup.HYBRID) {
    score += 10;
  } else if (job.workSetup === WorkSetup.ONSITE) {
    if (profile.acceptsOnsite) score += 5;
    else redFlags.push('On-site only');
  } else {
    score += 5;
  }

  // Penalties
  if (job.shift === Shift.NIGHT && !profile.acceptsNightShift) {
    score -= 15;
    redFlags.push('Night shift');
  }
  for (const s of job.requiredSkills) {
    if (avoid.has(normalizeSkill(s))) {
      score -= 20;
      redFlags.push(`Requires ${s}`);
    }
  }

  return { score: Math.max(0, Math.min(100, score)), reasons, redFlags };
}
