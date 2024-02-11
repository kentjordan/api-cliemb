import { IsString } from "class-validator";

export default class UserRefreshTokenDto {
    @IsString()
    refresh_token: string
}