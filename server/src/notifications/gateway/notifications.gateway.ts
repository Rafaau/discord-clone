import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { NotificationsService } from "../notifications.service";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: ['http://localhost:4200'] } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly notificationsService: NotificationsService
    ) {}

    @WebSocketServer()
    server: Server

    handleConnection() {
        
    }

    handleDisconnect() {
        
    }

    @SubscribeMessage('createNotification')
    async handleCreateNotification(
        socket: Socket,
        params: any
    ) {
        const notification = await this.notificationsService
            .createNotification(params[0], params[1])
        this.server.emit('newNotification', notification)
    }

    @SubscribeMessage('markAsRead')
    async handleMarkAsRead(
        socket: Socket,
        id: number
    ) {
        const readed = await this.notificationsService
            .markAsRead(id)
        this.server.emit('readedNotification', readed)
    }
}