import { z } from 'zod';
import { Shift, WorkSetup } from '../jobs/job.enums.js';

export const ExtractedJobSchema = z.object({
  title: z.string().nullable(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  workSetup: z.nativeEnum(WorkSetup).nullable(),
  shift: z.nativeEnum(Shift),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  currency: z.string().nullable(),
  yearsRequired: z.number().nullable(),
  requiredSkills: z.array(z.string()),
  niceToHave: z.array(z.string()),
});

export type ExtractedJob = z.infer<typeof ExtractedJobSchema>;
