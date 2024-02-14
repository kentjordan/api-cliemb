import { PartialType } from "@nestjs/mapped-types";
import SignupUserDto from "src/auth/dto/signupUser.dto";

export default class UpdateUserDto extends PartialType(SignupUserDto) { }