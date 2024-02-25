import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Query, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../utils/guards/auth.guard';
import UpdateUserDto from './dto/updateUser.dto';
import UserEntity, { UserRole } from 'src/types/User.type';
import User from 'src/utils/decorators/User.decorator';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  // TODO: [✅] Get all users with pagination (limits and offsets)
  // TODO: Analytics (numbers of users by roles)
  // TODO: [✅] GET , PATCH, and DELETE  user by :id

  @Get('/search')
  searchUserByName(@Query('q') q: string) {
    return this.usersService.searchUserByName(q);
  }

  @Get('/analytics')
  getAnalytics() {
    return this.usersService.getAnalytics();
  }

  @Get("/all")
  getAllUsers(@Query('limit') limit = undefined,
    @Query('offset') offset = undefined,
    @Query('role') role: UserRole) {
    return this.usersService.getAllUsers({
      limit,
      offset,
      role
    });
  }

  @Get(":id")
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch(":id")
  updateUserById(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUserById(id, dto);
  }

  @Delete(":id")
  deleteUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteUserById(id);
  }

  @Get()
  getAuthdtUser(@User() user: UserEntity) {
    return this.usersService.getAuthdtUser(user);
  }

  @Patch()
  updateAuthdUser(@User() user: UserEntity, @Body() dto: UpdateUserDto) {
    return this.usersService.updateAuthdUser(user, dto);
  }

}
