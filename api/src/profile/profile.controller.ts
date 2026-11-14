import { Body, Controller, Get, Put } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  get() {
    return this.profileService.get();
  }

  @Put()
  update(@Body() dto: UpdateProfileDto) {
    return this.profileService.update(dto);
  }
}
