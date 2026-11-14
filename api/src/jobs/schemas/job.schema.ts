import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { JobSource, JobStatus, Shift, WorkSetup } from '../job.enums.js';

@Schema({ timestamps: true })
export class Job {
  @Prop({ type: String, enum: JobSource, required: true })
  source: JobSource;

  @Prop({ required: true })
  rawText: string;

  @Prop({ type: String, default: null })
  url: string | null;

  @Prop({ type: String, default: null })
  title: string | null;

  @Prop({ type: String, default: null })
  company: string | null;

  @Prop({ type: String, default: null })
  location: string | null;

  @Prop({ type: String, enum: WorkSetup, default: null })
  workSetup: WorkSetup | null;

  @Prop({ type: String, enum: Shift, default: Shift.UNKNOWN })
  shift: Shift;

  @Prop({ type: Number, default: null })
  salaryMin: number | null;

  @Prop({ type: Number, default: null })
  salaryMax: number | null;

  @Prop({ type: String, default: null })
  currency: string | null;

  @Prop({ type: Number, default: null })
  yearsRequired: number | null;

  @Prop({ type: [String], default: [] })
  requiredSkills: string[];

  @Prop({ type: [String], default: [] })
  niceToHave: string[];

  @Prop({ type: Number, default: null })
  score: number | null;

  @Prop({ type: [String], default: [] })
  reasons: string[];

  @Prop({ type: [String], default: [] })
  redFlags: string[];

  @Prop({ type: String, enum: JobStatus, default: JobStatus.NEW })
  status: JobStatus;

  @Prop({ type: String, default: '' })
  notes: string;

  @Prop({ type: Date, default: null })
  appliedAt: Date | null;

  @Prop({ required: true, unique: true })
  contentHash: string;
}

export type JobDocument = HydratedDocument<Job>;
export const JobSchema = SchemaFactory.createForClass(Job);

// list sorting/filtering
JobSchema.index({ score: -1 });
JobSchema.index({ status: 1, score: -1 });
