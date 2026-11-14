import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { JobsController } from './jobs.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Job.name,
      schema: JobSchema,
    }]),
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
