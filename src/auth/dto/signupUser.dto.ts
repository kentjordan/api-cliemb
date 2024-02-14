import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export default class SignupUserDto {

    @IsString()
    @IsNotEmpty()
    @IsEnum(['STUDENT', 'PROFESSOR', 'STAFF'])
    role: 'STUDENT' | 'PROFESSOR' | 'STAFF'

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    sr_code: string

    @IsString()
    @IsNotEmpty()
    first_name: string

    @IsString()
    @IsNotEmpty()
    last_name: string

    @IsEmail()
    email: string

    @Length(8)
    @IsString()
    password: string

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    emergency_no: Array<string>

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    medical_conditions: Array<string>

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