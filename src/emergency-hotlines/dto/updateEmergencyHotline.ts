import { PartialType } from "@nestjs/mapped-types";
import { CreateEmergencyHotline } from "./createEmergencyHotline";

export class UpdateEmergencyHotline extends PartialType(CreateEmergencyHotline) { }