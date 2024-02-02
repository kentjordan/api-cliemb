import { Module } from "@nestjs/common";
import AdminsLogController from "./adminsLog.controller";
import AdminsLogService from "./adminsLog.service";

@Module({
    controllers: [AdminsLogController],
    providers: [AdminsLogService]
})
export class AdminsLogModule { }