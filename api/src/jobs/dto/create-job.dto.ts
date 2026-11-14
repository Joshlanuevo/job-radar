import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { JobSource } from '../job.enums.js';

// Temporary manual create for Day 1. Day 2 replaces it with POST /jobs/analyze.
export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  rawText: string;

  @IsOptional()
  @IsEnum(JobSource)
  source?: JobSource;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}
