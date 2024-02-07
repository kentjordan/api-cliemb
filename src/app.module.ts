import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';
import { DetailsModule } from './details/details.module';

@Module({
  imports: [AuthModule, PrismaModule, StudentsModule, DetailsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
