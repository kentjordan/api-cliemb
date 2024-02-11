import { PartialType } from "@nestjs/mapped-types";
import SignupAdminDto from "src/auth/dto/signupAdmin.dto";

export default class UpdateAdminDto extends PartialType(SignupAdminDto) { }