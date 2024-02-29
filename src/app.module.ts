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
import { AdminsLogModule } from './admins-log/adminsLog.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Response } from 'express';
import { OfflineEmergencyModule } from './offline-emergency/offline-emergency.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      exclude: ['/api/(.*)'],
      serveStaticOptions: {
        setHeaders(res: Response, path, stat) {
          res.contentType("image/png");
          res.set("Content-Disposition", "inline;")
        },
      }
    }),
    AuthModule,
    PrismaModule,
    UsersModule,
    DetailsModule,
    AdminsModule,
    EmergencyHotlinesModule,
    MonitoringModule,
    AdminsLogModule,
    UploadModule,
    OfflineEmergencyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
