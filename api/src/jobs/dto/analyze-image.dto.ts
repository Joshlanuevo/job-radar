import { IsOptional, IsUrl } from 'class-validator';

export class AnalyzeImageDto {
  @IsOptional()
  @IsUrl()
  url?: string;
}
