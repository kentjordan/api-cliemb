import { ParseUUIDPipe, UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import MonitoringService from "./monitoring.service";
import { PrismaExceptionWebSocketFilter } from "src/utils/filters/PrismaException.ws-filter";
import EmergencyDetailsDto from "./dto/emergencyDetails.dto";

@WebSocketGateway(5001, { namespace: "ws/emergency", cors: ["*"] })
export default class MonitoringGateway implements OnGatewayConnection {

    constructor(private readonly monitoringService: MonitoringService) { }

    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket, ...args: any[]) { }

}
