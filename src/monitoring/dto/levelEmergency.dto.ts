import { IsNumber, ValidateNested } from "class-validator"
import EmergencyDetailsDto from "./emergencyDetails.dto"
import { Type } from "class-transformer"

export default class CreateLevelEmergencyDto {
    @IsNumber()
    emergency_level: number

    @ValidateNested({ each: true })
    @Type(() => EmergencyDetailsDto)
    details: EmergencyDetailsDto
}