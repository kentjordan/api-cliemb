import { IsEmail, IsString, Length } from "class-validator";

export default class LoginStudentDto {
    @IsEmail()
    email: string

    @IsString()
    @Length(8)
    password: string
}