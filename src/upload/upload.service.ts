import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import UserEntity from 'src/types/User.type';

@Injectable()
export class UploadService {

    constructor(private readonly db: PrismaService) { }

    private makeImageURL(file: Express.Multer.File) {
        return process.env.NODE_ENV === 'production' ?
            `${process.env.PROD_API_HOSTNAME}/images/${file.filename}`
            : `${process.env.DEV_API_HOSTNAME}/images/${file.filename}`
    }

    async uploadUserDp(user: UserEntity, file: Express.Multer.File) {
        await this.db.user.update({
            where: {
                id: user.id
            },
            data: {
                profile_photo: this.makeImageURL(file)
            }
        });
    }

    async uploadAdminDp(admin: UserEntity, file: Express.Multer.File) {
        await this.db.admin.update({
            where: {
                id: admin.id
            },
            data: {
                profile_photo: this.makeImageURL(file)
            }
        });
    }

    async uploadUserEmergencyPhoto(file: Express.Multer.File) {
        return this.makeImageURL(file);
    }

}
