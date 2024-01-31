import { IsEmail, IsString, Length } from "class-validator"

export default class LoginAdminDto {

    @IsEmail()
    email: string

    @IsString()
    @Length(8)
    password: string
}
