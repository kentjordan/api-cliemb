import { IsString } from "class-validator";

export default class StudentRefreshTokenDto {
    @IsString()
    refresh_token: string
}