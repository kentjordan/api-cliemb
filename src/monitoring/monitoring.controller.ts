import { Body, Controller, Get, Param, Patch, Post, UseFilters, UseGuards } from "@nestjs/common";
import MonitoringGateway from "./monitoring.gateway";
import MonitoringService from "./monitoring.service";
import CreateLevelEmergencyDto from "./dto/levelEmergency.dto";
import User from "src/utils/decorators/User.decorator";
import UserEntity from "src/types/User.type";
import { AuthGuard } from "src/utils/guards/auth.guard";
import { PrismaExceptionFilter } from "src/utils/filters/PrismaException.filter";
import { IMonitoringState } from "./entity/monitoring.entity";

@UseGuards(AuthGuard)
@UseFilters(PrismaExceptionFilter)
@Controller('monitoring')
export default class MonitoringCntroller {

    constructor(
        private readonly monitoringService: MonitoringService,
        private readonly monitoringGateway: MonitoringGateway
    ) { }

    @Post()
    createUserLevelEmergency(
        @User() user: UserEntity,
        @Body() body: CreateLevelEmergencyDto
    ) {
        return this.monitoringService.createUserLevelEmergency(
            user,
            body,
            this.monitoringGateway.server
        );
    }

    @Get('state')
    getUserLevelEmergencyState(@User() user: UserEntity) {
        return this.monitoringService.getUserLevelEmergencyState(user);
    }

    @Patch('state/:user_id')
    updateUserLevelEmergencySTate(
        @Param('user_id') user_id: string,
        @Body() body: { state: IMonitoringState, monitoring_id: string }
    ) {
        return this.monitoringService.updateUserLevelEmergencySTate(user_id, body);
    }

}