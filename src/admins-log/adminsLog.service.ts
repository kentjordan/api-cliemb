import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export default class AdminsLogService {

    constructor(private readonly db: PrismaService) { }

    async getAllAdminsLog() {
        return await this.db.$queryRaw`
            SELECT RHS.admin_id, first_name, last_name, position, date, time_in, time_out, no_of_cases
            FROM 
                (SELECT history.admin_id, history.date, time_in, time_out, no_of_cases
                FROM
                    (SELECT
                        admin_id, 
                        to_char(created_at + interval '8h', 'YYYY-MM-DD') AS date,
                        COUNT(*) AS no_of_cases
                    FROM
                        received_case
                    GROUP BY
                        admin_id, to_char(created_at + interval '8h', 'YYYY-MM-DD')
                    ) AS cases
                RIGHT JOIN
                    (SELECT
                        admin_id,
                        to_char(created_at + interval '8h', 'YYYY-MM-DD') AS date,
                        to_char(time_in, 'HH:MI PM') AS time_in,
                        to_char(time_out, 'HH:MI PM') AS time_out
                        FROM
                                admin_logged_in_history
                        GROUP BY
                                admin_id, to_char(created_at + interval '8h', 'YYYY-MM-DD'),
                        time_in,
                        time_out
                        ) AS history
                ON
                    history.admin_id = cases.admin_id
                AND
                    history.date = cases.date) AS RHS
            JOIN
                admin AS LHS
            ON RHS.admin_id  = LHS.id
            ORDER BY date DESC, time_in DESC
        `
    }

    async searchAdminsLog(q: string) {

        const condition = q.split(' ').map((e: string) => `${e.toLowerCase()}%`)

        return await this.db.$queryRaw`
            SELECT RHS.admin_id, first_name, last_name, position, date, time_in, time_out, no_of_cases
            FROM 
                (SELECT history.admin_id, history.date, time_in, time_out, no_of_cases
                FROM
                    (SELECT
                        admin_id, 
                        to_char(created_at + interval '8h', 'YYYY-MM-DD') AS date,
                        COUNT(*) AS no_of_cases
                    FROM
                        received_case
                    GROUP BY
                        admin_id, to_char(created_at + interval '8h', 'YYYY-MM-DD')
                    ) AS cases
                RIGHT JOIN
                    (SELECT
                        admin_id,
                        to_char(created_at + interval '8h', 'YYYY-MM-DD') AS date,
                        to_char(time_in, 'HH:MI PM') AS time_in,
                        to_char(time_out, 'HH:MI PM') AS time_out
                        FROM
                                admin_logged_in_history
                        GROUP BY
                                admin_id, to_char(created_at + interval '8h', 'YYYY-MM-DD'),
                        time_in,
                        time_out
                        ) AS history
                ON
                    history.admin_id = cases.admin_id
                AND
                    history.date = cases.date) AS RHS
            JOIN
                admin AS LHS
            ON RHS.admin_id  = LHS.id
            WHERE
                lower(first_name) LIKE ANY(array[${condition}])
                OR
                lower(last_name) LIKE ANY(array[${condition}])
            ORDER BY date DESC, time_in DESC
        `
    }

}