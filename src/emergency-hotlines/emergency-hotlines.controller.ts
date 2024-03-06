import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EmergencyHotlinesService } from './emergency-hotlines.service';
import { CreateEmergencyHotline } from './dto/createEmergencyHotline';
import { UpdateEmergencyHotline } from './dto/updateEmergencyHotline';
import { AuthGuard } from 'src/utils/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('emergency-hotlines')
export class EmergencyHotlinesController {

  constructor(private readonly emergencyHotlinesService: EmergencyHotlinesService) { }

  @Post()
  createEmergencyHotline(@Body() dto: CreateEmergencyHotline) {
    return this.emergencyHotlinesService.createEmergencyHotline(dto);
  }

  @Get()
  getAllEmergencyHotlines() {
    return this.emergencyHotlinesService.getAllEmergencyHotlines()
  }

  @Get('search')
  searchEmergencyHotlines(@Query('q') q: string) {
    return this.emergencyHotlinesService.searchEmergencyHotlines(q);
  }

  @Get(':id')
  getEmergencyHotlinesById(@Param('id') id: string) {
    return this.emergencyHotlinesService.getEmergencyHotlinesById(id)
  }

  @Patch(':id')
  updateEmergencyHotlineById(@Param('id') id: string, @Body() dto: UpdateEmergencyHotline) {
    return this.emergencyHotlinesService.updateEmergencyHotlineById(id, dto);
  }

  @Delete(':id')
  deleteEmergencyHotlineById(@Param('id') id: string) {
    return this.emergencyHotlinesService.deleteEmergencyHotlineById(id)
  }

}