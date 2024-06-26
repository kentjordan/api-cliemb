import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import UserEntity, { UserRole } from 'src/types/User.type';
import UpdateUserDto from './dto/updateUser.dto';

@Injectable()
export class UsersService {

    constructor(private readonly db: PrismaService) { }

    async searchUserByName(q: string) {

        const condition = q.split(' ').map((e: string) => `${e.toLowerCase()}%`)

        return await this.db.$queryRaw`
            SELECT
                id,
                role,
                sr_code,
                first_name,
                last_name,
                emergency_no,
                medical_conditions,
                email,
                province,
                city,
                barangay,
                profile_photo
            FROM "user"
            WHERE
                lower(first_name) LIKE ANY(array[${condition}])
                OR
                lower(last_name) LIKE ANY(array[${condition}])
        `;
    }

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
                updated_at: new Date().toISOString()
            },
            where: {
                id
            }
        })
    }

    async deleteUserById(user_id: string) {

        await this.db.details.deleteMany({
            where: {
                user_id
            }
        });

        await this.db.received_case.deleteMany({
            where: {
                user_id
            }
        });

        await this.db.$queryRaw
            `
        DELETE 
        FROM 
            monitoring_updates 
        WHERE 
            monitoring_id 
        IN (SELECT 
                id 
            FROM 
                monitoring
            WHERE 
                user_id = ${user_id}::UUID
            )
        `;

        await this.db.monitoring.deleteMany({
            where: {
                user_id
            }
        });

        await this.db.user.delete({
            where: {
                id: user_id
            }
        });

    }

    async getAllUsers({ role, limit, offset }: { limit: number, offset: number, role: UserRole }) {
        return await this.db.user.findMany({
            skip: offset,
            take: limit,
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
                profile_photo: true,
                is_account_approved: true
            },
            where: {
                role: role
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
                profile_photo: true,
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
