import { PartialType } from "@nestjs/mapped-types";
import SignupUserDto from "src/auth/dto/signupUser.dto";

export default class UpdateStudentDto extends PartialType(SignupUserDto) { }