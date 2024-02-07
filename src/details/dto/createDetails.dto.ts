import { IsArray, IsNotEmpty, IsString } from "class-validator"

export default class CreateDetailsDto {

    @IsNotEmpty()
    @IsString()
    room: string

    @IsNotEmpty()
    @IsString()
    floor_no: string

    @IsNotEmpty()
    @IsString({ each: true })
    @IsArray()
    equipment_needed: string[]

    @IsNotEmpty()
    @IsString()
    narrative: string
}