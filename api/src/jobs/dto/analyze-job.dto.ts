import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class AnalyzeJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  text: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}
