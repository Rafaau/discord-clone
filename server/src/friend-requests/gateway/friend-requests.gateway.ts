import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { FriendRequestsService } from "../friend-requests.service";
import eventBus from "src/utils/file-service/event-bus";
import { Server, Socket } from "socket.io";
import { NotificationsService } from "src/notifications/notifications.service";
import { CreateNotificationParams } from "src/utils/types";

@WebSocketGateway({ cors: { origin: [process.env.CLIENT_ORIGIN || 'http://localhost:4200'] } })
export class FriendRequestsGateway {
    constructor (
        private readonly friendRequestsService: FriendRequestsService,
        private readonly notificationsService: NotificationsService
    ) {
        eventBus.on('newFriendRequest', (friendRequest, senderId) => {
            friendRequest.userIds.forEach(userId => {
                this.server.to(userId.toString())
                           .emit('newFriendRequest', [friendRequest, senderId])
            })
        })
        eventBus.on('acceptedFriendRequest', (friendRequest) => {
            this.server.to(friendRequest.sender.id.toString())
                       .emit('acceptedFriendRequest', friendRequest)
            this.server.to(friendRequest.receiver.id.toString())
                       .emit('acceptedFriendRequest', friendRequest)
        })
        eventBus.on('declinedFriendRequest', (friendRequest) => {
            this.server.to(friendRequest.sender.id.toString())
                       .emit('declinedFriendRequest', friendRequest)
            this.server.to(friendRequest.receiver.id.toString())
                       .emit('declinedFriendRequest', friendRequest)
        })
    }

    @WebSocketServer()
    server: Server

    @SubscribeMessage('sendFriendRequest')
    async handleSendFriendRequest(
        socket: Socket,
        params: any
    ) {
        const friendRequest = await this.friendRequestsService
            .sendFriendRequest(params[0], params[1])
        if (friendRequest.isSuccess) {
            const message: CreateNotificationParams = {
                message: `${friendRequest.data.sender.username} sent you a friend request`,
                source: 'Pending'
            }
            const notification = await this.notificationsService
                .createNotification(message, friendRequest.data.receiver.id)
            eventBus.emit('newNotification', notification)
        }
        eventBus.emit('newFriendRequest', friendRequest, params[0])
    }

    @SubscribeMessage('acceptFriendRequest')
    async handleAcceptFriendRequest(
        socket: Socket,
        id: number
    ) {
        const friendRequest = await this.friendRequestsService
            .acceptFriendRequest(id)
        eventBus.emit('acceptedFriendRequest', friendRequest)
    }

    @SubscribeMessage('declineFriendRequest')
    async handleDeclineFriendRequest(
        socket: Socket,
        id: number
    ) {
        const friendRequest = await this.friendRequestsService
            .declineFriendRequest(id)
        eventBus.emit('declinedFriendRequest', friendRequest)
    }
}