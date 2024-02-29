import { Module } from '@nestjs/common';
import { OfflineEmergencyService } from './offline-emergency.service';
import { OfflineEmergencyController } from './offline-emergency.controller';

@Module({
  controllers: [OfflineEmergencyController],
  providers: [OfflineEmergencyService],
})
export class OfflineEmergencyModule {}
