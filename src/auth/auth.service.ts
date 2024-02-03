import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import SignupAdminDto from './dto/signupAdmin.dto';
import SignupStudentDto from './dto/signupStudent.dto';
import { JwtService } from '@nestjs/jwt';
import LoginAdminDto from './dto/loginAdmin.dto';
import * as argon from 'argon2'
import LoginStudentDto from './dto/loginStudent.dto';

@Injectable()
export class AuthService {

    AT_EXPIRY: string = '12h';
    RT_EXPIRY: string = '15d';

    constructor(
        private readonly db: PrismaService,
        private readonly jwt: JwtService) { }

    async signupStudent(body: SignupStudentDto) {

        const hashedPassword = await argon.hash(body.password);

        const createdStudent = await this.db.student.create({
            select: {
                id: true
            },
            data: {
                ...body,
                password: hashedPassword,
                email: body.email.toLocaleLowerCase(),
                sr_code: body.sr_code.toLocaleLowerCase(),
            }
        })

        if (createdStudent) {

            const access_token = this.jwt.sign({ id: createdStudent.id }, { expiresIn: this.AT_EXPIRY });
            const refresh_token = this.jwt.sign({ access_token }, { expiresIn: this.RT_EXPIRY });

            return {
                access_token,
                refresh_token
            }
        }

    }

    async loginStudent(body: LoginStudentDto) {

        const student = await this.db.student.findFirstOrThrow({
            select: {
                id: true,
                password: true
            },
            where: {
                email: body.email
            }
        });

        const verifiedPassword = await argon.verify(student.password, body.password);

        if (verifiedPassword) {

            const access_token = this.jwt.sign({ id: student.id }, { expiresIn: this.AT_EXPIRY });
            const refresh_token = this.jwt.sign({ access_token }, { expiresIn: this.RT_EXPIRY });

            return {
                access_token,
                refresh_token
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

            await this.db.admin_logged_in_history.create({
                data: {
                    admin_id: admin.id,
                    time_in: new Date().toISOString(),
                }
            });

            const access_token = this.jwt.sign({ id: admin.id }, { expiresIn: this.AT_EXPIRY });
            const refresh_token = this.jwt.sign({ access_token }, { expiresIn: this.RT_EXPIRY });

            return {
                access_token,
                refresh_token
            }
        }

        new HttpException('Invalid Password', HttpStatus.BAD_REQUEST)

    }

    async logoutAdmin() {

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