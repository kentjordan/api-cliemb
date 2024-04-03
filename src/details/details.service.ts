import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateDetailsDto from './dto/createDetails.dto';
import UserEntity from 'src/types/User.type';
import UpdatedetailsDto from './dto/updateDetails.dto';
import { Server } from 'socket.io';

@Injectable()
export class DetailsService {

    constructor(private readonly db: PrismaService) { }

    async createDetails(user: UserEntity, body: CreateDetailsDto) {
        await this.db.details.create({
            data: {
                ...body,
                user_id: user.id
            }
        });
    }

    async getDetails(user: UserEntity) {
        return this.db.details.findFirstOrThrow({
            select: {
                room: true,
                floor_no: true,
                equipment_needed: true,
                narrative: true
            },
            where: {
                user_id: user.id
            }
        });
    }

    async updateDetails(user: UserEntity, body: UpdatedetailsDto) {
        const updastedDetails = await this.db.details.update({
            select: {
                room: true,
                floor_no: true,
                equipment_needed: true,
                narrative: true
            },
            where: {
                user_id: user.id
            },
            data: {
                ...body
            }
        });

        return updastedDetails;
    }

    async updateDetailsWithMonitoring(user: UserEntity, body: UpdatedetailsDto, server: Server) {

        const userDetails = await this.getDetails(user);

        const updatedUserDetails = await this.db.details.update({
            select: {
                room: true,
                floor_no: true,
                equipment_needed: true,
                narrative: true
            },
            where: {
                user_id: user.id
            },
            data: {
                ...body
            }
        });

        const { id: monitoring_id } = await this.db.monitoring.findFirstOrThrow({
            select: {
                id: true
            },
            where: {
                user_id: user.id
            },
            orderBy: {
                created_at: "desc"
            }
        });

        await this.db.monitoring.update({
            where: {
                id: monitoring_id
            },
            data: {
                ...body
            }
        });

        // Get every updated detail's field
        const updatedDetailFields = Object.keys(body)
            .filter((key: string) => {
                if (key === 'equipment_needed') {
                    return body[key].join(",") !== userDetails['equipment_needed'].join(",")
                }
                return body[key] !== userDetails[key];
            }).map((key) => {
                return [key, {
                    updated_at: new Date().toISOString(),
                    isUpdated: true
                }]
            });

        await this.db.monitoring_updates.update({
            data: {
                ...Object.fromEntries(updatedDetailFields)
            },
            where: {
                monitoring_id,
            }
        });

        server.emit("web-update-monitoring");

        return updatedUserDetails;

    }

}
