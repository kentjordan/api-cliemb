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

    async getMonitoringData(state: IMonitoringState = null) {

        if (state !== "COMPLETED") {
            const to_receive = await this.db.$queryRaw<Array<any>>`
            SELECT
                M.id AS monitoring_id,
                U.id AS user_id,
                first_name,
                last_name,
                sr_code, 
                to_char(M.created_at, 'MM/DD/YY') AS date,
                to_char(M.created_at, 'HH12:MI:SS AM') AS time,
                room,
                floor_no,
                photo,
                narrative,
                state,
                    emergency_level
                FROM monitoring AS M
                JOIN "user" AS U
                ON M.user_id = U.id
                WHERE state = 'TO RECEIVE'::user_emergency_state
            ORDER BY emergency_level ASC
        `;

            const pending = await this.db.$queryRaw<Array<any>>`
            SELECT
                M.id AS monitoring_id,
                U.id AS user_id,
                first_name,
                last_name,
                sr_code, 
                M.created_at,
                room,
                floor_no,
                photo,
                narrative,
                state,
                emergency_level
            FROM monitoring AS M
            JOIN "user" AS U
            ON M.user_id = U.id
            WHERE state = 'PENDING'::user_emergency_state
            ORDER BY emergency_level ASC
        `;

            return [...to_receive, ...pending];
        }

        if (state === "COMPLETED")
            return await this.db.$queryRaw<Array<any>>`
            SELECT
                M.id AS monitoring_id,
                U.id AS user_id,
                first_name,
                last_name,
                sr_code, 
                M.created_at,
                room,
                floor_no,
                photo,
                narrative,
                state,
                emergency_level
            FROM monitoring AS M
            JOIN "user" AS U
            ON M.user_id = U.id
            WHERE state = 'COMPLETED'::user_emergency_state
            ORDER BY emergency_level ASC
        `;
    }

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

    async getUserLatestMonitoringRecord(user: UserEntity) {
        // Get the latest monitoring record of a user
        // but THROW if the user has no monitoring record yet
        return (await this.db.$queryRaw<{ state: IMonitoringState }[]>`
                SELECT state
                FROM monitoring
                WHERE user_id = ${user.id}::UUID
                ORDER BY created_at DESC;
            `).at(0).state;
    }

    async createUserLevelEmergency(user: UserEntity, body: LevelEmergencyDto, server: Server) {

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
            // but THROW if the user has no monitoring record yet
            try {

                const monitoringState = (await this.db.$queryRaw<{ state: IMonitoringState }[]>`
                                            SELECT state
                                            FROM monitoring
                                            WHERE user_id = ${user.id}::UUID
                                            ORDER BY created_at DESC;
                                        `).at(0).state;

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

                    server.emit("web-new-monitoring-message");

                    return;
                }

                const userDetails = await this.updateUserDetails(user, {
                    ...body.details,
                    equipment_needed: body.details.equipment_needed,
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
                    equipment_needed: body.details.equipment_needed,
                    narrative: userDetails.narrative
                });

                server.emit("web-new-monitoring-message");

            } catch (error) {

                const userDetails = await this.updateUserDetails(user, {
                    ...body.details,
                    equipment_needed: body.details.equipment_needed,
                    photo: "",
                });

                await this.createUserMonitoring(user, body.emergency_level, {
                    ...body.details,
                    equipment_needed: body.details.equipment_needed,
                    photo: "",
                    narrative: userDetails.narrative
                });

                server.emit("web-new-monitoring-message");

            }

        } catch (error) {
            // User has no details so, we will
            // create a new user details
            const userDetails = await this.db.details.create({
                data: {
                    floor_no: body.details.floor_no,
                    room: body.details.room,
                    user_id: user.id,
                    equipment_needed: body.details.equipment_needed.split(","),
                },
            });

            await this.createUserMonitoring(user, body.emergency_level, {
                ...body.details,
                equipment_needed: body.details.equipment_needed,
                photo: "",
                narrative: userDetails.narrative
            });

            server.emit("web-new-monitoring-message");

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

    async updateUserLevelEmergencyState(admin: UserEntity, user_id: string, { state, monitoring_id }: { state: IMonitoringState, monitoring_id: string }) {
        await this.db.$queryRaw`
            UPDATE
                monitoring
            SET
                state = ${state}::user_emergency_state
            WHERE
                id = ${monitoring_id}::UUID AND user_id = ${user_id}::UUID;
        `;

        await this.db.received_case.create({
            data: {
                admin_id: admin.id,
                user_id,
                monitoring_id,
            }
        })
    }
}