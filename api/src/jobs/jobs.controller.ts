import {
  BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query,
  UnsupportedMediaTypeException, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnalyzeImageDto } from './dto/analyze-image.dto.js';
import { JobsService } from './jobs.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { QueryJobsDto } from './dto/query-jobs.dto.js';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { AnalyzeJobDto } from './dto/analyze-job.dto.js';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024; // Claude's limit is 5 MB per image; this stays safely under it

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Post('analyze')
  analyze(@Body() analyzeJobDto: AnalyzeJobDto) {
    return this.jobsService.analyze(analyzeJobDto);
  }

  @Post('analyze-image')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: MAX_IMAGE_BYTES }, // too big → Nest returns 413
      fileFilter: (_req, file, cb) => {
        if (IMAGE_TYPES.includes(file.mimetype)) cb(null, true);
        else cb(new UnsupportedMediaTypeException('Use a PNG, JPEG or WebP image'), false);
      },
    }),
  )
  analyzeImage(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: AnalyzeImageDto,
  ) {
    if (!file) throw new BadRequestException('image file is required');
    return this.jobsService.analyzeImage(file, dto.url);
  }

  @Post('rescore')
  rescore() {
    return this.jobsService.rescoreAll();
  }

  @Get()
  findAll(@Query() query: QueryJobsDto) {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.jobsService.remove(id);
  }
}
