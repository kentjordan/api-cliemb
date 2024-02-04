import { PartialType } from "@nestjs/mapped-types";
import SignupStudentDto from "src/auth/dto/signupStudent.dto";

export default class UpdateStudentDto extends PartialType(SignupStudentDto) { }