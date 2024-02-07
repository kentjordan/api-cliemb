import { PartialType } from "@nestjs/mapped-types";
import CreateDetailsDto from "./createDetails.dto";

export default class UpdatedetailsDto extends PartialType(CreateDetailsDto) { }