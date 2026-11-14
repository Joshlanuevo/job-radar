import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { JobStatus } from '../job.enums.js';

export class UpdateJobDto {
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
