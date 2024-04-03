import { Module } from '@nestjs/common';
import { DetailsService } from './details.service';
import { DetailsController } from './details.controller';
import MonitoringModule from 'src/monitoring/monitoring.module';

@Module({
  imports: [MonitoringModule],
  controllers: [DetailsController],
  providers: [DetailsService],
})
export class DetailsModule { }
