import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';

import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import User from 'src/utils/decorators/User.decorator';
import UserEntity from 'src/types/User.type';
import { AuthGuard } from 'src/utils/guards/auth.guard';

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {

  constructor(private readonly uploadService: UploadService) { }

  @Post('/users/dp')
  @UseInterceptors(FileInterceptor('photo'))
  uploadUserDp(@User() user: UserEntity, @UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadUserDp(user, file);
  }

  @Post('/admins/dp')
  @UseInterceptors(FileInterceptor('photo'))
  uploadAdminDp(@User() admin: UserEntity, @UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadAdminDp(admin, file);
  }

  @Post('/users/monitoring')
  @UseInterceptors(FileInterceptor('photo'))
  uploadUserEmergencyPhoto(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadUserEmergencyPhoto(file);
  }

}
