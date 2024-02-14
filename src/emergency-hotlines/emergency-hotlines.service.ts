import { Injectable } from '@nestjs/common';
import { CreateEmergencyHotline } from './dto/createEmergencyHotline';
import { UpdateEmergencyHotline } from './dto/updateEmergencyHotline';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmergencyHotlinesService {

    constructor(private readonly db: PrismaService) { }

    async createEmergencyHotline(dto: CreateEmergencyHotline) {
        await this.db.emergency_hotlines.create({
            data: {
                ...dto
            }
        });
    }

    async getAllEmergencyHotlines() {
        return await this.db.emergency_hotlines.findMany();
    }

    async getEmergencyHotlinesById(id: string) {
        return await this.db.emergency_hotlines.findUniqueOrThrow({
            where: {
                id
            }
        });
    }

    async updateEmergencyHotlineById(id: string, dto: UpdateEmergencyHotline) {
        await this.db.emergency_hotlines.update({
            where: {
                id
            },
            data: {
                ...dto,
                updated_at: new Date().toISOString()
            }
        });
    }

    async deleteEmergencyHotlineById(id: string) {
        await this.db.emergency_hotlines.delete({
            where: {
                id
            }
        });
    }

}
