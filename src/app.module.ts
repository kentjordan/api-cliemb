import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { DetailsModule } from './details/details.module';
import { AdminsModule } from './admins/admins.module';
import { EmergencyHotlinesModule } from './emergency-hotlines/emergency-hotlines.module';
import MonitoringModule from './monitoring/monitoring.module';

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, DetailsModule, AdminsModule, EmergencyHotlinesModule, MonitoringModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
