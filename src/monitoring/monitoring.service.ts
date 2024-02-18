import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";
import LevelEmergencyDto from "./dto/levelEmergency.dto";
import EmergencyDetailsDto from "./dto/emergencyDetails.dto";
import { IMonitoringState } from "./entity/monitoring.entity";
import UserEntity from "src/types/User.type";

@Injectable()
export default class MonitoringService {

    constructor(private readonly db: PrismaService) { }

    async createUserDetails(user: UserEntity, details: EmergencyDetailsDto) {
        return await this.db.details.create({
            data: {
                floor_no: details.floor_no,
                room: details.room,
                user_id: user.id,
                equipment_needed: details.equipment_needed.split(",").map((e) => e.trim()),
                narrative: details.narrative
            },
        });
    }

    async updateUserDetails(user: UserEntity, details: EmergencyDetailsDto) {

        try {
            return await this.db.details.update({
                data: {
                    user_id: user.id,
                    floor_no: details.floor_no,
                    room: details.room,
                    equipment_needed: details.equipment_needed.split(",").map((e) => e.trim()),
                    narrative: details.narrative
                },
                where: {
                    user_id: user.id
                }
            });

        } catch (error) {
            console.log(error);
        }

    }

    async createUserMonitoring(user: UserEntity, emergency_level: number, details: EmergencyDetailsDto) {
        return await this.db.monitoring.create({
            data: {
                state: "TO_RECEIVE",
                floor_no: details.floor_no,
                room: details.room,
                equipment_needed: details.equipment_needed.split(",").map((e) => e.trim()),
                narrative: details.narrative,
                photo: details.photo.split(",").map((e) => e.trim()),
                user_id: user.id,
                emergency_level: emergency_level
            }
        });
    }

    async updateUserMonitoring(user: UserEntity, monitoring_id: string, emergency_level: number, details: EmergencyDetailsDto) {
        return await this.db.monitoring.update({
            data: {
                updated_at: new Date().toISOString(),
                room: details.room,
                floor_no: details.floor_no,
                equipment_needed: details.equipment_needed.split(",").map((e) => e.trim()),
                photo: details.photo.split(",").map((e) => e.trim()),
                narrative: details.narrative,
                emergency_level,
            },
            where: {
                id: monitoring_id,
                user_id: user.id
            }
        })
    }

    async createUserLevelEmergency(user: UserEntity, body: LevelEmergencyDto, server: Server) {

        const _user = await this.db.user.findUniqueOrThrow({ where: { id: user.id } });

        try {

            // Throw if the user has no details yet
            await this.db.details.findFirstOrThrow({
                where: {
                    user_id: user.id
                },
                orderBy: {
                    created_at: "desc"
                }
            });

            // Get the latest monitoring record of a user
            const { state: monitoringState } = (await this.db.$queryRaw<{ state: IMonitoringState }[]>`
                SELECT state
                FROM monitoring
                WHERE user_id = ${user.id}::UUID
                ORDER BY created_at DESC;
            `).at(0);

            // If the monitoring state is completed
            // create a new monitoring record
            if (monitoringState === "COMPLETED") {

                const userDetails = await this.updateUserDetails(user, {
                    ...body.details,
                    equipment_needed: body.details.equipment_needed,
                    photo: "",

                });
                const userMonitoring = await this.createUserMonitoring(user, body.emergency_level, {
                    ...body.details,
                    equipment_needed: body.details.equipment_needed,
                    photo: "",
                    narrative: userDetails.narrative
                });

                server.emit("web-received-message");

                return;
            }

            // Monitoring record state is not completed,
            // Update the user details in Details and Monitoring Table
            const userDetails = await this.updateUserDetails(user, {
                ...body.details,
                photo: "",
            });

            const monitoringRecord = await this.db.monitoring.findFirstOrThrow({
                where: {
                    AND: [
                        { user_id: user.id },
                        {
                            OR: [
                                {
                                    state: "PENDING"
                                }, {
                                    state: "TO_RECEIVE"
                                }
                            ]
                        }
                    ]
                },
                orderBy: {
                    created_at: "desc"
                }
            })

            await this.updateUserMonitoring(user, monitoringRecord.id, body.emergency_level, {
                ...body.details,
                photo: "",
                narrative: userDetails.narrative
            });

            server.emit("web-monitoring-message");

        } catch (error) {
            // User has no details so, we will
            // create a new user details
            const userDetails = await this.db.details.create({
                data: {
                    floor_no: body.details.floor_no,
                    room: body.details.room,
                    user_id: user.id,
                },
            });

            const userMonitoring = await this.createUserMonitoring(user, body.emergency_level, {
                ...body.details,
                equipment_needed: "",
                photo: "",
                narrative: userDetails.narrative
            });

            server.emit("web-monitoring-message");

        }
    }

    async getUserLevelEmergencyState(user: UserEntity) {
        return (await this.db.$queryRaw<IMonitoringState>`
            SELECT
                state
            FROM
                monitoring
            WHERE
                user_id = ${user.id}::UUID
            ORDER BY
                created_at DESC
            LIMIT 1;
        `).at(0);
    }

    async updateUserLevelEmergencySTate(user_id: string, { state, monitoring_id }: { state: IMonitoringState, monitoring_id: string }) {
        await this.db.$queryRaw`
            UPDATE
                monitoring
            SET
                state = ${state}::user_emergency_state
            WHERE
                id = ${monitoring_id}::UUID AND user_id = ${user_id}::UUID;
        `;
    }
}