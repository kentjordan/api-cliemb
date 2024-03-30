import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import MonitoringService from "./monitoring.service";

@WebSocketGateway(5001, { namespace: "ws/emergency", cors: ["*"] })
export default class MonitoringGateway implements OnGatewayConnection {

    constructor(private readonly monitoringService: MonitoringService) { }

    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket, ...args: any[]) { }

    @SubscribeMessage('register-user-room')
    async registerUserRoom(@ConnectedSocket() socket: Socket, @MessageBody() id: string) {
        socket.join(id);
    }
}
