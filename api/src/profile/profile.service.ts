import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Profile } from './schemas/profile.schema.js';
import { Model } from 'mongoose';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfileService {
  constructor(@InjectModel(Profile.name) private readonly profileModel: Model<Profile>) {}

  // Always returns a profile; creates the default one on first call
  async get() {
    return this.profileModel
      .findOneAndUpdate({}, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true })
      .lean();
  }

  async update(dto: UpdateProfileDto) {
    return this.profileModel
      .findOneAndUpdate({}, dto, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true })
      .lean();
  }
}

