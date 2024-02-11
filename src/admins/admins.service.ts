import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import UserEntity from 'src/types/User.type';
import UpdateAdminDto from './dto/updateAdmin.dto';
import * as asrgon from 'argon2';

@Injectable()
export class AdminsService {

    constructor(private readonly db: PrismaService) { }

    async getAdmin(user: UserEntity) {
        return await this.db.admin.findUniqueOrThrow({
            select: {
                position: true,
                first_name: true,
                last_name: true,
                username: true,
                contact_no: true,
                email: true,
            },
            where: {
                id: user.id
            }
        });
    }

    async updateAdmin(user: UserEntity, body: UpdateAdminDto) {

        if (body.password) {
            const hashedPassword = await asrgon.hash(body.password);

            await this.db.admin.update({
                data: {
                    ...body,
                    password: hashedPassword,
                    updated_at: new Date().toISOString()
                },
                where: {
                    id: user.id
                }
            });

            return;
        }

        await this.db.admin.update({
            data: {
                ...body,
                updated_at: new Date().toISOString()
            },
            where: {
                id: user.id
            }
        });
    }

}
