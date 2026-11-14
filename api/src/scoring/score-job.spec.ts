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

    it('matches Node.js against NodeJS', () => {
        const r = scoreJob(job({ requiredSkills: ['Node.js'] }), profile({ skills: ['NodeJS'] }));
        expect(r.reasons).toContain('Matches 1/1 required skills');
    });

    it('flags an avoided skill and lowers the score', () => {
        const base = scoreJob(job(), profile());
        const r = scoreJob(job({ requiredSkills: ['React', 'Angular'] }), profile());
        expect(r.redFlags).toContain('Requires Angular');
        expect(r.score).toBeLessThan(base.score);
    });

    it('flags salary below my minimum', () => {
        const r = scoreJob(job({ salaryMax: 50000 }), profile({ minSalary: 70000 }));
        expect(r.redFlags).toContain('Max salary 50000 is below your 70000');
    });

    it('flags on-site only when I do not accept on-site', () => {
        const r = scoreJob(job({ workSetup: WorkSetup.ONSITE }), profile({ acceptsOnsite: false }));
        expect(r.redFlags).toContain('On-site only');
    });

    it('does not flag on-site when I accept on-site', () => {
        const r = scoreJob(job({ workSetup: WorkSetup.ONSITE }), profile({ acceptsOnsite: true }));
        expect(r.redFlags).not.toContain('On-site only');
    });

    it('flags when required years are well above mine', () => {
        const r = scoreJob(job({ yearsRequired: 6 }), profile({ yearsExperience: 3 }));
        expect(r.redFlags).toContain('Needs 6 yrs experience');
    });

    it('never goes below 0 when every penalty stacks', () => {
        const r = scoreJob(
            job({
                requiredSkills: ['Angular'],
                yearsRequired: 10,
                salaryMax: 10000,
                workSetup: WorkSetup.ONSITE,
                shift: Shift.NIGHT,
            }),
            profile(),
        );
        expect(r.score).toBe(0);
    });

    it('does not compare a USD salary against my PHP minimum', () => {
        const r = scoreJob(job({ currency: 'USD', salaryMax: 1000 }), profile({ minSalary: 70000 }));
        expect(r.redFlags).toEqual([]);
    });

});
