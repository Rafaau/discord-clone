import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { NotificationsService } from "../notifications.service";
import { Server, Socket } from "socket.io";
import eventBus from "src/utils/file-service/event-bus";
import { allowedOrigins } from "src/utils/allowed-origins";

@WebSocketGateway({ cors: { origin: allowedOrigins } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly notificationsService: NotificationsService
    ) {
        eventBus.on('newNotification', (notification) => {
            this.server.to(notification.recipient.id.toString())
                       .emit('newNotification', notification)
        })
        eventBus.on('readedNotification', (notification) => {
            this.server.to(notification.recipient.id.toString())
                       .emit('readedNotification', notification)
        })
    }

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
        if (params[1] == notification?.recipient.id)
            eventBus.emit('newNotification', notification)
    }

    @SubscribeMessage('markAsRead')
    async handleMarkAsRead(
        socket: Socket,
        params: any
    ) {
        const readed = await this.notificationsService
            .markAsRead(params[0])
        if (params[1] == readed.recipient.id)
            eventBus.emit('readedNotification', readed)
    }
}