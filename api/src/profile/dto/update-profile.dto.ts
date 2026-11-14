import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  resumeText: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsInt()
  @Min(0)
  yearsExperience: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minSalary: number | null;

  @IsBoolean()
  acceptsOnsite: boolean;

  @IsBoolean()
  acceptsNightShift: boolean;

  @IsArray()
  @IsString({ each: true })
  avoidSkills: string[];
}
