import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessageReactionsService } from "../message-reactions.service";
import eventBus from "src/utils/file-service/event-bus";
import { allowedOrigins } from "src/utils/allowed-origins";

@WebSocketGateway({ cors: { origin: allowedOrigins }})
export class MessagesReactionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly messageReactionsService: MessageReactionsService
    ) {
        eventBus.on('newMessageReaction', (reaction) => {
            reaction.userIds.forEach(userId => {
                this.server.to(userId)
                           .emit('newMessageReaction', reaction.newMessageReaction)
            })
        })
        eventBus.on('deletedReaction', (params) => {
            this.server.emit('deletedReaction', [params[0], params[1]])
        })
    }

    @WebSocketServer()
    server: Server

    handleConnection() { }

    handleDisconnect() { }

    @SubscribeMessage('sendReaction')
    async handleSendReaction(
        socket: Socket,
        params: any
    ) {
        const reaction = await this.messageReactionsService
            .createMessageReaction(params[0], params[1], params[2], params[3])
        eventBus.emit('newMessageReaction', reaction)
    }

    @SubscribeMessage('deleteReaction')
    async handleDeleteReaction(
        socket: Socket,
        params: any
    ) {
        const deletedReaction = await this.messageReactionsService
            .deleteReaction(params[0])
        if (deletedReaction.statusCode == 200)
            eventBus.emit('deletedReaction', [params[0], params[1]])
    }
}