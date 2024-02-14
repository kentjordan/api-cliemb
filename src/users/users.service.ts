import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import UserEntity, { UserRole } from 'src/types/User.type';
import UpdateUserDto from './dto/updateUser.dto';

@Injectable()
export class UsersService {

    constructor(private readonly db: PrismaService) { }

    async getAnalytics() {
        return await this.db.$queryRaw`
            SELECT role, COUNT(role)
            FROM "user"
            GROUP BY role;
        `
    }

    async getUserById(id: string) {
        return await this.db.user.findUniqueOrThrow({
            select: {
                id: true,
                role: true,
                sr_code: true,
                first_name: true,
                last_name: true,
                emergency_no: true,
                medical_conditions: true,
                email: true,
                province: true,
                city: true,
                barangay: true,
                profile_photo: true
            },
            where: {
                id
            }
        });
    }

    async updateUserById(id: string, dto: UpdateUserDto) {
        await this.db.user.update({
            data: {
                ...dto,
                province: dto.province.trim(),
                city: dto.city.trim(),
                barangay: dto.barangay.trim(),
                updated_at: new Date().toISOString()
            },
            where: {
                id
            }
        })
    }

    async deleteUserById(id: string) {
        return await this.db.user.delete({
            where: {
                id
            }
        });
    }

    async getAllUsers(query: { limit: number, offset: number, role: UserRole }) {
        return await this.db.user.findMany({
            skip: query.offset,
            take: query.limit,
            select: {
                id: true,
                role: true,
                sr_code: true,
                first_name: true,
                last_name: true,
                emergency_no: true,
                medical_conditions: true,
                email: true,
                province: true,
                city: true,
                barangay: true,
                profile_photo: true
            },
            where: {
                role: query.role
            }
        });
    }

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

    async updateAuthdUser(user: UserEntity, dto: UpdateUserDto) {
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
