import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateDetailsDto from './dto/createDetails.dto';
import UserEntity from 'src/types/User.type';
import UpdatedetailsDto from './dto/updateDetails.dto';

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

}
