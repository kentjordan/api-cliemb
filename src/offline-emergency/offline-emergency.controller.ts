import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OfflineEmergencyService } from './offline-emergency.service';
import CreateLevelEmergencyDto from 'src/monitoring/dto/levelEmergency.dto';
import User from 'src/utils/decorators/User.decorator';
import UserEntity from 'src/types/User.type';
import { Request } from 'express';
import { AuthGuard } from 'src/utils/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('offline-emergency')
export class OfflineEmergencyController {
  constructor(private readonly offlineEmergencyService: OfflineEmergencyService) { }

  @Post()
  async createOfflineEmergency(
    @Req() req: Request,
    @User() user: UserEntity,
    @Body() body: CreateLevelEmergencyDto) {
    return this.offlineEmergencyService.createOfflineEmergency(req, body);
  }

}
