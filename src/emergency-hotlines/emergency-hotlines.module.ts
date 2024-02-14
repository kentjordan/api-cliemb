import { Module } from '@nestjs/common';
import { EmergencyHotlinesService } from './emergency-hotlines.service';
import { EmergencyHotlinesController } from './emergency-hotlines.controller';

@Module({
  controllers: [EmergencyHotlinesController],
  providers: [EmergencyHotlinesService],
})
export class EmergencyHotlinesModule {}
