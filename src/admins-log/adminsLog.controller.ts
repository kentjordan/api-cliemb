import { Controller, Get, Query } from "@nestjs/common";
import AdminsLogService from "./adminsLog.service";

@Controller('admins-log')
export default class AdminsLogController {

    constructor(private readonly adminsLogService: AdminsLogService) { }

    @Get()
    adminsLog() {
        return this.adminsLogService.getAllAdminsLog();
    }

    @Get('search')
    searchAdminsLog(@Query('q') q: string) {
        return this.adminsLogService.searchAdminsLog(q);
    }

}