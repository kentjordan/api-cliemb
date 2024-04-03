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

    async searchUserMonitoring(state: IMonitoringState, q: string, limit: number, offset: number) {

        const condition = q.split(' ').map((e: string) => `${e.toLowerCase()}%`)

        switch (state) {
            case 'TO RECEIVE':
            case 'PENDING':
                const to_receive = await this.db.$queryRaw<Array<any>>`
                    SELECT
                        M.id AS monitoring_id,
                        U.id AS user_id,
                        first_name,
                        last_name,
                        sr_code, 
                        to_char(M.created_at + interval '8h', 'YYYY-MM-DD') AS date,
                        to_char(M.created_at + interval '8h', 'HH:MI PM') AS time,
                        room,
                        floor_no,
                        photo,
                        narrative,
                        state,
                            emergency_level
                        FROM monitoring AS M
                        JOIN "user" AS U
                        ON M.user_id = U.id
                        WHERE 
                            state = 'TO RECEIVE'::user_emergency_state
                            AND
                            (
                                lower(first_name) LIKE ANY(array[${condition}])
                                OR
                                lower(last_name) LIKE ANY(array[${condition}])
                                OR
                                to_char(M.created_at + interval '8h', 'YYYY-MM-DD') LIKE ANY(array[${condition}])
                            )
                    ORDER BY
                        emergency_level ASC,
                        M.created_at DESC
                `;

                const pending = await this.db.$queryRaw<Array<any>>`
                    SELECT
                        M.id AS monitoring_id,
                        U.id AS user_id,
                        first_name,
                        last_name,
                        sr_code, 
                        to_char(M.created_at + interval '8h', 'YYYY-MM-DD') AS date,
                        to_char(M.created_at + interval '8h', 'HH:MI PM') AS time,
                        room,
                        floor_no,
                        photo,
                        narrative,
                        state,
                        emergency_level
                    FROM monitoring AS M
                    JOIN "user" AS U
                    ON M.user_id = U.id
                    WHERE
                        state = 'PENDING'::user_emergency_state
                        AND
                        (
                            lower(first_name) LIKE ANY(array[${condition}])
                            OR
                            lower(last_name) LIKE ANY(array[${condition}])
                            OR
                            to_char(M.created_at + interval '8h', 'YYYY-MM-DD') LIKE ANY(array[${condition}])
                        )
                    ORDER BY
                        emergency_level ASC,
                        M.created_at DESC
                    `;
                return [...to_receive, ...pending];

            case 'COMPLETED':
                return await this.db.$queryRaw<Array<any>>`
                    SELECT
                        M.id AS monitoring_id,
                        U.id AS user_id,
                        first_name,
                        last_name,
                        sr_code, 
                        to_char(M.created_at + interval '8h', 'YYYY-MM-DD') AS date,
                        to_char(M.created_at + interval '8h', 'HH:MI PM') AS time,
                        room,
                        floor_no,
                        photo,
                        narrative,
                        state,
                        emergency_level
                    FROM monitoring AS M
                    JOIN "user" AS U
                    ON M.user_id = U.id
                    WHERE
                        state = 'COMPLETED'::user_emergency_state 
                        AND
                        (
                            lower(first_name) LIKE ANY(array[${condition}])
                            OR
                            lower(last_name) LIKE ANY(array[${condition}])
                            OR
                            to_char(M.created_at + interval '8h', 'YYYY-MM-DD') LIKE ANY(array[${condition}])
                        )
                    ORDER BY
                        M.created_at DESC
                    LIMIT ${limit}
                    OFFSET ${offset}
                `;
        }
    }

    async getMonitoringDataSize(state: IMonitoringState = null) {

        if (state === 'COMPLETED') {
            return (await this.db.$queryRaw<Array<{ count: number }>>`
            SELECT COUNT(*)        
            FROM monitoring
            WHERE state = 'COMPLETED'::user_emergency_state
        `).at(0);
        }

        return (await this.db.$queryRaw<Array<{ count: number }>>`
            SELECT COUNT(*)        
            FROM monitoring
            WHERE state = ${state}::user_emergency_state
        `).at(0);
    }

    async getMonitoringData(state: IMonitoringState = null, limit: number, offset: number) {

        if (state !== "COMPLETED") {
            const to_receive = await this.db.$queryRaw<Array<any>>`
            SELECT
                M.id AS monitoring_id,
                U.id AS user_id,
                first_name,
                last_name,
                sr_code, 
                to_char(M.created_at + interval '8h', 'YYYY-MM-DD') AS date,
                to_char(M.created_at + interval '8h', 'HH:MI PM') AS time,
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
            ORDER BY
                emergency_level ASC,
                M.created_at DESC
        `;

            const pending = await this.db.$queryRaw<Array<any>>`
            SELECT
                M.id AS monitoring_id,
                U.id AS user_id,
                first_name,
                last_name,
                sr_code, 
                to_char(M.created_at + interval '8h', 'YYYY-MM-DD') AS date,
                to_char(M.created_at + interval '8h', 'HH:MI PM') AS time,
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
            ORDER BY
                emergency_level ASC,
                M.created_at DESC
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
                    to_char(M.created_at + interval '8h', 'YYYY-MM-DD') AS date,
                    to_char(M.created_at + interval '8h', 'HH:MI PM') AS time,
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
                ORDER BY
                    M.created_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
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

    async createMonitoringUpdates(monitoringId: string,) {
        await this.db.monitoring_updates.create({
            data: {
                monitoring_id: monitoringId
            }
        });
    }

    async createUserMonitoring(user: UserEntity, emergency_level: number, details: EmergencyDetailsDto) {

        try {
            return (await this.db.$queryRaw`
            INSERT INTO monitoring(         
                state,
                floor_no,
                room,
                equipment_needed,
                narrative,
                photo,
                user_id,
                emergency_level)
            VALUES(
                ${"TO RECEIVE"}::user_emergency_state,
                ${details.floor_no},
                ${details.room},
                ${details.equipment_needed.split(",").map((e) => e.trim())},
                ${details.narrative},
                ${details.photo ? details.photo.split(",").map((e) => e.trim()) : undefined},
                ${user.id}::UUID,
                ${emergency_level})
            RETURNING id;
            `)[0];
        } catch (error) {
            console.log(error);
        }
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
                        photo: body.details.photo,

                    });

                    const userMonitoring = await this.createUserMonitoring(user, body.emergency_level, {
                        ...body.details,
                        equipment_needed: body.details.equipment_needed,
                        photo: body.details.photo,
                        narrative: userDetails.narrative
                    });

                    await this.createMonitoringUpdates(userMonitoring.id);

                    server.emit("web-new-monitoring-message");

                    return;
                }

                const userDetails = await this.updateUserDetails(user, {
                    ...body.details,
                    equipment_needed: body.details.equipment_needed,
                    photo: body.details.photo,
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
                    photo: body.details.photo,
                    equipment_needed: body.details.equipment_needed,
                    narrative: userDetails.narrative
                });

                // await this.createMonitoringUpdates()

                server.emit("web-new-monitoring-message");

            } catch (error) {

                const userDetails = await this.updateUserDetails(user, {
                    ...body.details,
                    equipment_needed: body.details.equipment_needed,
                    photo: body.details.photo,
                });

                const userMonitoring = await this.createUserMonitoring(user, body.emergency_level, {
                    ...body.details,
                    equipment_needed: body.details.equipment_needed,
                    photo: body.details.photo,
                    narrative: userDetails.narrative
                });

                await this.createMonitoringUpdates(userMonitoring.id);

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

            const userMonitoring = await this.createUserMonitoring(user, body.emergency_level, {
                ...body.details,
                equipment_needed: body.details.equipment_needed,
                photo: body.details.photo,
                narrative: userDetails.narrative
            });

            await this.createMonitoringUpdates(userMonitoring.id);

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

    async updateUserLevelEmergencyState(admin: UserEntity, user_id: string, { state, monitoring_id }: { state: IMonitoringState, monitoring_id: string }, server: Server) {
        await this.db.$queryRaw`
            UPDATE
                monitoring
            SET
                state = ${state}::user_emergency_state
            WHERE
                id = ${monitoring_id}::UUID AND user_id = ${user_id}::UUID;
        `;

        // Send an event to the user
        server.to(user_id).emit("update-emergency-request-state");

        // state now is PENDING after the user clicked the TO RECEIVE button in frontend
        if (state === "PENDING") {

            await this.db.$queryRaw`
                INSERT INTO
                    received_case(created_at, admin_id, user_id, monitoring_id)
                VALUES
                    (CURRENT_TIMESTAMP, ${admin.id}::UUID, ${user_id}::UUID, ${monitoring_id}::UUID)
           `
        }
    }
}