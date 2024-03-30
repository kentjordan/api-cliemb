import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import SignupAdminDto from './dto/signupAdmin.dto';
import SignupUserDto from './dto/signupUser.dto';
import { JwtService } from '@nestjs/jwt';
import LoginAdminDto from './dto/loginAdmin.dto';
import * as argon from 'argon2'
import LoginStudentDto from './dto/loginUser.dto';
import UserEntity from 'src/types/User.type';
import { DateTime } from 'luxon';

@Injectable()
export class AuthService {

    AT_EXPIRY: string = '12h';
    RT_EXPIRY: string = '15d';

    constructor(
        private readonly db: PrismaService,
        private readonly jwt: JwtService) { }

    async signupUser(body: SignupUserDto) {

        const hashedPassword = await argon.hash(body.password);

        if (body.role === 'STUDENT') {
            let createdUser = await this.db.user.create({
                select: {
                    id: true,
                    role: true,
                },
                data: {
                    ...body,
                    password: hashedPassword,
                    email: body.email.toLocaleLowerCase(),
                    sr_code: body.sr_code.toLocaleLowerCase(),
                }
            })
            if (createdUser) {

                const access_token = this.jwt.sign({ id: createdUser.id, role: createdUser.role }, { expiresIn: this.AT_EXPIRY });
                const refresh_token = this.jwt.sign({ access_token }, { expiresIn: this.RT_EXPIRY });

                return {
                    access_token,
                    refresh_token
                }
            }

        }
        let createdUser = await this.db.user.create({
            select: {
                id: true,
                role: true,
            },
            data: {
                ...body,
                password: hashedPassword,
                email: body.email.toLocaleLowerCase(),
            }
        })
        if (createdUser) {

            const access_token = this.jwt.sign({ id: createdUser.id, role: createdUser.role }, { expiresIn: this.AT_EXPIRY });
            const refresh_token = this.jwt.sign({ access_token }, { expiresIn: this.RT_EXPIRY });

            return {
                access_token,
                refresh_token
            }
        }

    }

    async loginUser(body: LoginStudentDto) {

        const user = await this.db.user.findFirstOrThrow({
            select: {
                id: true,
                role: true,
                password: true,
                is_account_approved: true
            },
            where: {
                email: body.email
            }
        });

        if (!user.is_account_approved)
            throw new HttpException('Account has not been approved.', HttpStatus.UNAUTHORIZED)

        const verifiedPassword = await argon.verify(user.password, body.password);

        if (verifiedPassword) {

            const access_token = this.jwt.sign({ id: user.id, role: user.role }, { expiresIn: this.AT_EXPIRY });
            const refresh_token = this.jwt.sign({ access_token }, { expiresIn: this.RT_EXPIRY });

            return {
                access_token,
                refresh_token,
                user_id: user.id
            }
        }

        throw new HttpException('Invalid Password', HttpStatus.BAD_REQUEST)

    }

    async signupAdmin(body: SignupAdminDto) {

        const hashedPassword = await argon.hash(body.password);

        const createdAdmin = await this.db.admin.create({
            select: {
                id: true,
            },
            data: {
                ...body,
                position: body.position.toLowerCase(),
                email: body.email.toLowerCase(),
                password: hashedPassword
            }
        });

        // Create admin logged in history with time_in
        await this.db.$queryRaw`
                    INSERT INTO admin_logged_in_history(admin_id, time_in)
                    VALUES(${createdAdmin.id}::UUID, CURRENT_TIMESTAMP)
        `;

        const access_token = this.jwt.sign({ id: createdAdmin.id }, { expiresIn: this.AT_EXPIRY });
        const refresh_token = this.jwt.sign({ access_token }, { expiresIn: this.RT_EXPIRY });

        return {
            access_token,
            refresh_token
        }
    }

    async loginAdmin(body: LoginAdminDto) {

        const admin = await this.db.admin.findFirstOrThrow({
            select: {
                id: true,
                password: true
            },
            where: {
                email: body.email
            }
        });

        const verifiedPassword = await argon.verify(admin.password, body.password)

        if (verifiedPassword) {

            try {

                // Throw if there's no record then create a admin logged in record
                await this.db.admin_logged_in_history.findFirstOrThrow({
                    where: {
                        admin_id: admin.id
                    }
                });

                const todayLoggedInCount = await this.db.$queryRaw<Array<{ count: number }>>`
                    SELECT
                        COUNT(*)
                    FROM
                        admin_logged_in_history
                    WHERE
                        admin_id = ${admin.id}::UUID
                    AND
                        to_char(created_at, 'YYYY-MM-DD') = to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD');
                `;

                // If there's no record of logged in TODAY, create a new one by throwing an error
                if (todayLoggedInCount.at(0).count <= 0) {
                    throw new Error();
                }

            } catch (error) {
                console.log(error);

                // Create admin logged in history with time_in
                await this.db.$queryRaw`
                    INSERT INTO admin_logged_in_history(admin_id, time_in)
                    VALUES(${admin.id}::UUID, CURRENT_TIMESTAMP)
               `;
            }

            const access_token = this.jwt.sign({ id: admin.id }, { expiresIn: this.AT_EXPIRY });
            const refresh_token = this.jwt.sign({ access_token }, { expiresIn: this.RT_EXPIRY });

            return {
                access_token,
                refresh_token
            }
        }

        throw new HttpException('Invalid Password', HttpStatus.BAD_REQUEST)

    }

    async logoutAdmin(admin: UserEntity) {
        // Update the time_out field when the user logout
        await this.db.$queryRaw<Array<any>>`
            UPDATE admin_logged_in_history
            SET 
                updated_at = CURRENT_TIMESTAMP,
                time_out = CURRENT_TIMESTAMP
            WHERE
                admin_id = ${admin.id}::UUID
                AND
                to_char(time_in, 'YYYY-MM-DD') = ${DateTime.now().toFormat("kkkk-MM-dd")}
            `;
    }

    refreshToken(refresh_token: string) {

        const decodedRT = this.jwt.verify(refresh_token, { secret: process.env.JWT_SECRET_KEY }) as { access_token: string, iat: number, exp: number };
        const decodedAT = this.jwt.decode(decodedRT.access_token) as { id: string, username: string, iat: number, exp: number };

        const AT = this.jwt.sign({ id: decodedAT.id, username: decodedAT.username }, {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: this.AT_EXPIRY
        });

        const RT = this.jwt.sign({ access_token: AT }, {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: this.RT_EXPIRY
        });

        return {
            access_token: AT,
            refresh_token: RT
        };

    }

}
