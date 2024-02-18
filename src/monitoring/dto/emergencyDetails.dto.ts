import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export default class EmergencyDetailsDto {

    @IsNotEmpty()
    @IsString()
    room: string

    @IsNotEmpty()
    @IsString()
    floor_no: string

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    equipment_needed: string

    @IsString({ each: true })
    @IsOptional()
    photo: string

    @IsString()
    @IsOptional()
    narrative: string
}