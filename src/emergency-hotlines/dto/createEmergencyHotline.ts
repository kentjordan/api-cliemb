import { Transform, TransformFnParams } from "class-transformer"
import { IsArray, IsNotEmpty, IsString, NotContains } from "class-validator"

export class CreateEmergencyHotline {

    @IsString()
    @IsNotEmpty()
    name: string

    @IsArray()
    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    landline_no: string[]

    @IsArray()
    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    mobile_no: string[]

    @IsString()
    @IsNotEmpty()
    province: string

    @IsString()
    @IsNotEmpty()
    city: string

    @IsString()
    @IsNotEmpty()
    barangay: string

}