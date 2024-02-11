import { Body, Controller, Get, Patch, UseFilters, UseGuards } from '@nestjs/common';
import { AdminsService } from './admins.service';
import User from 'src/utils/decorators/User.decorator';
import UserEntity from 'src/types/User.type';
import { AuthGuard } from 'src/utils/guards/auth.guard';
import UpdateAdminDto from './dto/updateAdmin.dto';
import { PrismaExceptionFilter } from 'src/utils/filters/PrismaException.filter';

@UseGuards(AuthGuard)
@UseFilters(PrismaExceptionFilter)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) { }

  @Get()
  getAdmin(@User() user: UserEntity) {
    return this.adminsService.getAdmin(user);
  }

  @Patch()
  updateAdmin(@User() user: UserEntity, @Body() body: UpdateAdminDto) {
    return this.adminsService.updateAdmin(user, body);
  }

}
