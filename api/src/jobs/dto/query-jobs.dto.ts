import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { JobStatus, WorkSetup } from '../job.enums.js';

export class QueryJobsDto {
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @Type(() => Number) // query params arrive as strings
  @IsInt()
  @Min(0)
  @Max(100)
  minScore?: number;

  @IsOptional()
  @IsEnum(WorkSetup)
  workSetup?: WorkSetup;

  @IsOptional()
  @IsIn(['score', 'newest'])
  sort?: 'score' | 'newest';
}
