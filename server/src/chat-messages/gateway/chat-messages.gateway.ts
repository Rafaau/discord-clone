import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { SubscribeMessage } from "@nestjs/websockets/decorators";
import { Server } from "socket.io";
import { Socket } from "socket.io";
import { ChatMessagesService } from "../chat-messages.service";

@WebSocketGateway({ cors: { origin: ['http://localhost:4200'] } })
export class ChatMessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly chatMessagesService: ChatMessagesService
    ) {}

    @WebSocketServer()
    server: Server

    handleConnection() {
    }

    handleDisconnect() {
    }

    @SubscribeMessage('sendChatMessage')
    async handleMessage(
        socket: Socket,
        params: any
    ) {
        const message = await this.chatMessagesService
            .createChatMessage(params[0], params[1], params[2])
        this.server.emit('newChatMessage', message)
    }

    @SubscribeMessage('editChatMessage')
    async handleEditMessage(
        socket: Socket,
        params: any
    ) {
        const editedMessage = await this.chatMessagesService
            .updateChatMessage(params[0], params[1])
        this.server.emit('editedChatMessage', editedMessage)
    }

    @SubscribeMessage('deleteChatMessage')
    async handleDeleteMessage(
        socket: Socket,
        id: number
    ) {
        const deletedMessage = await this.chatMessagesService
            .deleteChatMessage(id)
        if (deletedMessage.statusCode == 200)
            this.server.emit('deletedChatMessage', id)
    }
}