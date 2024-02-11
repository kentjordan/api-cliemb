import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import UserEntity from 'src/types/User.type';
import UpdateStudentDto from './dto/updateUser.dto';

@Injectable()
export class UsersService {

    constructor(private readonly db: PrismaService) { }

    async getAuthdtUser(user: UserEntity) {
        return await this.db.user.findUnique({
            select: {
                id: true,
                first_name: true,
                last_name: true,
                role: true,
                sr_code: true,
                province: true,
                city: true,
                barangay: true,
                emergency_no: true,
                medical_conditions: true,
            },
            where: {
                id: user.id
            }
        });
    }

    async updateAuthdUser(user: UserEntity, dto: UpdateStudentDto) {
        await this.db.user.update({
            where: {
                id: user.id
            },
            data: {
                ...dto,
                province: dto.province.trim(),
                city: dto.city.trim(),
                barangay: dto.barangay.trim(),
                updated_at: new Date().toISOString()
            }
        });
    }

}
