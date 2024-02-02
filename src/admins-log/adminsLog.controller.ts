import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Controller()
export default class AdminsLogController {

    constructor(private readonly db: PrismaService) { }

    @Get()
    adminsLog() {

    }

}