import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Req, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsGuard } from './students.guard';
import UpdateStudentDto from './dto/updateStudent.dto';
import { Request } from 'express';
import UserEntity from 'src/types/User.type';
import User from 'src/utils/decorators/User.decorator';

@Controller('students')
@UseGuards(StudentsGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @Get(':id')
  getStudentById(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.getStudentById(id);
  }

  @Patch()
  updateStudent(@User() user: UserEntity, @Req() req: Request, @Body() dto: UpdateStudentDto) {
    return this.studentsService.updateStudentById(user, dto);
  }

}
