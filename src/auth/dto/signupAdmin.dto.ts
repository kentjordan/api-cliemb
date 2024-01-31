import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator"

export default class SignupAdminDto {

    @IsNotEmpty()
    @IsString()
    first_name: string

    @IsNotEmpty()
    @IsString()
    last_name: string

    @IsEmail()
    email: string

    @Length(8)
    @IsString()
    password: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    gender: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    contact_no: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @IsNotEmpty()
    position: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    province: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    city: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    barangay: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    profile_photo: string

}