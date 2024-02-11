import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../utils/guards/auth.guard';
import UpdateStudentDto from './dto/updateUser.dto';
import UserEntity from 'src/types/User.type';
import User from 'src/utils/decorators/User.decorator';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  @Get()
  getAuthdtUser(@User() user: UserEntity) {
    return this.usersService.getAuthdtUser(user);
  }

  @Patch()
  updateAuthdUser(@User() user: UserEntity, @Body() dto: UpdateStudentDto) {
    return this.usersService.updateAuthdUser(user, dto);
  }

}
