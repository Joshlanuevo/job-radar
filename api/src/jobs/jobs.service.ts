import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from './schemas/job.schema.js';
import { Model, QueryFilter, SortOrder } from 'mongoose';
import { createHash } from 'node:crypto';
import { JobSource, JobStatus } from './job.enums.js';
import { QueryJobsDto } from './dto/query-jobs.dto.js';
import { ExtractionService } from '../extraction/extraction.service.js';
import { AnalyzeJobDto } from './dto/analyze-job.dto.js';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<Job>,
    private readonly extraction: ExtractionService,
  ) { }

  static hashContent(text: string): string {
    const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');
    return createHash('sha256').update(normalized).digest('hex');
  }

  async create(createJobDto: CreateJobDto) {
    try {
      return await this.jobModel.create({
        ...createJobDto,
        source: createJobDto.source ?? JobSource.PASTE,
        contentHash: JobsService.hashContent(createJobDto.rawText),
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictException('This job post is already saved');
      }
      throw err;
    }
  }

  async analyze(analyzeJobDto: AnalyzeJobDto) {
    const contentHash = JobsService.hashContent(analyzeJobDto.text);

    // 1. Duplicate check BEFORE calling Claude (duplicates shouldn't cost money)
    if (await this.jobModel.exists({ contentHash })) {
      throw new ConflictException('This job post is already saved');
    }

    // 2. AI extracts the facts
    const extracted = await this.extraction.extractFromText(analyzeJobDto.text);

    // 3. Save
    try {
      return await this.jobModel.create({
        ...extracted,
        rawText: analyzeJobDto.text,
        url: analyzeJobDto.url ?? null,
        source: JobSource.PASTE,
        contentHash,
      });
    } catch (err) {
      // Two identical requests at the same time can both pass step 1
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictException('This job post is already saved');
      }
      throw err;
    }
  }

  findAll(query: QueryJobsDto) {
    const filter: QueryFilter<Job> = {};
    if (query.status) filter.status = query.status;
    if (query.workSetup) filter.workSetup = query.workSetup;
    if (query.minScore !== undefined) filter.score = { $gte: query.minScore };

    const sort: Record<string, SortOrder> =
      query.sort === 'newest' ? { createdAt: -1 } : { score: -1, createdAt: -1 };

    return this.jobModel.find(filter).sort(sort).lean();
  }

  async findOne(id: string) {
    const job = await this.jobModel.findById(id).lean();
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    const changes: Partial<Job> = { ...updateJobDto };
    if (updateJobDto.status === JobStatus.APPLIED) changes.appliedAt = new Date();

    const job = await this.jobModel
      .findByIdAndUpdate(id, changes, { returnDocument: 'after' })
      .lean();
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async remove(id: string) {
    const job = await this.jobModel.findByIdAndDelete(id);
    if (!job) throw new NotFoundException('Job not found');
  }
}
