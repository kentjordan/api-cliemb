import { Module } from "@nestjs/common";
import MonitoringGateway from "./monitoring.gateway";
import MonitoringService from "./monitoring.service";
import MonitoringCntroller from "./monitoring.controller";

@Module({
    controllers: [MonitoringCntroller],
    providers: [MonitoringService, MonitoringGateway],
    exports: [MonitoringGateway]
})
export default class MonitoringModule { }