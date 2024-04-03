import { Body, Controller, Get, Patch, Post, UseFilters, UseGuards } from '@nestjs/common';
import { DetailsService } from './details.service';
import CreateDetailsDto from './dto/createDetails.dto';
import User from 'src/utils/decorators/User.decorator';
import UserEntity from 'src/types/User.type';
import { AuthGuard } from 'src/utils/guards/auth.guard';
import { PrismaExceptionFilter } from 'src/utils/filters/PrismaException.filter';
import UpdatedetailsDto from './dto/updateDetails.dto';
import MonitoringGateway from 'src/monitoring/monitoring.gateway';

@Controller('details')
@UseGuards(AuthGuard)
@UseFilters(PrismaExceptionFilter)
export class DetailsController {

  constructor(
    private readonly detailsService: DetailsService,
    private readonly monitoringGateway: MonitoringGateway) { }

  @Post()
  async createDetails(@User() user: UserEntity, @Body() body: CreateDetailsDto) {
    return await this.detailsService.createDetails(user, body);
  }

  @Get()
  getDetails(@User() user: UserEntity) {
    return this.detailsService.getDetails(user);
  }

  @Patch()
  updateDetails(@User() user: UserEntity, @Body() body: UpdatedetailsDto) {
    return this.detailsService.updateDetails(user, body);
  }

  @Patch('/with-monitoring')
  updateDetailsWithMonitoring(@User() user: UserEntity, @Body() body: UpdatedetailsDto) {
    return this.detailsService.updateDetailsWithMonitoring(user, body, this.monitoringGateway.server);
  }

}
