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

// postText comes FIRST: the model writes fields in order, so it reads the post before extracting from it
export const ExtractedJobFromImageSchema = z.object({
  postText: z.string().describe('Full text of the job post, exactly as written. Exclude app UI like buttons, likes, comments.'),
  ...ExtractedJobSchema.shape,
});

export type ExtractedJobFromImage = z.infer<typeof ExtractedJobFromImageSchema>;
