import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessageReactionsService } from "../message-reactions.service";

@WebSocketGateway({ cors: { origin: ['http://localhost:4200'] }})
export class MessagesReactionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly messageReactionsService: MessageReactionsService
    ) {}

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
        this.server.emit('newMessageReaction', reaction)
    }

    @SubscribeMessage('deleteReaction')
    async handleDeleteReaction(
        socket: Socket,
        params: any
    ) {
        const deletedReaction = await this.messageReactionsService
            .deleteReaction(params[0])
        if (deletedReaction.statusCode == 200)
            this.server.emit('deletedReaction', [params[0], params[1]])
    }
}