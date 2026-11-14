import { JobsService } from './jobs.service.js';

describe('hashContent', () => {
  it('ignores case and extra whitespace', () => {
    expect(JobsService.hashContent('  Senior  React\nDev ')).toBe(
      JobsService.hashContent('senior react dev'),
    );
  });
});
