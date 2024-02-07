import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import UserEntity from 'src/types/User.type';
import UpdateStudentDto from './dto/updateStudent.dto';

@Injectable()
export class StudentsService {

    constructor(private readonly db: PrismaService) { }

    async getStudentById(id: string) {
        return await this.db.student.findUnique({
            select: {
                first_name: true,
                last_name: true,
                sr_code: true,
                province: true,
                city: true,
                barangay: true,
                emergency_no: true,
                medical_conditions: true,
            },
            where: {
                id
            }
        });
    }

    async updateStudentById(user: UserEntity, dto: UpdateStudentDto) {
        await this.db.student.update({
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
