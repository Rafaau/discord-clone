import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { WebSocketServer } from "@nestjs/websockets/decorators";
import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets/interfaces";
import { Server, Socket } from "socket.io";
import { CreateDirectMessageParams } from "src/utils/types";
import { DirectMessagesService } from "../direct-messages.service";
import eventBus from "src/utils/event-bus";
import { allowedOrigins } from "src/utils/allowed-origins";

@WebSocketGateway({ cors: { origin: allowedOrigins } })
export class DirectMessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly directMessagesService: DirectMessagesService
    ) {
        eventBus.on('newDirectMessage', (message) => {
            message.directConversation.users.forEach(user => {
                this.server.to(user.id.toString())
                           .emit('newDirectMessage', message)
            })
        })
        eventBus.on('editedDirectMessage', (message) => {
            message.directConversation.users.forEach(user => {
                this.server.to(user.id.toString())
                           .emit('editedDirectMessage', message)   
            })
        })
        eventBus.on('deletedDirectMessage', (message) => {
            message.directConversation.users.forEach(user => {
                this.server.to(user.id.toString())
                           .emit('deletedDirectMessage', message)
            })
        })
    }

    @WebSocketServer()
    server: Server

    handleConnection() {
        
    }

    handleDisconnect() {
        
    }

    @SubscribeMessage('sendDirectMessage') 
    async handleMessage(
        socket: Socket, 
        params: any
    ) {
        const message = await this.directMessagesService
           .createDirectMessage(params[0], params[1], params[2])
        eventBus.emit('newDirectMessage', message)
    }

    @SubscribeMessage('editDirectMessage')
    async handleEditMessage(
        socket: Socket,
        params: any
    ) {
        const editedMessage = await this.directMessagesService
            .updateDirectMessage(params[0], params[1])
        eventBus.emit('editedDirectMessage', editedMessage)
    }

    @SubscribeMessage('deleteDirectMessage')
    async handleDeleteMessage(
        socket: Socket,
        id: number
    ) {
        const deletedMessage = await this.directMessagesService
            .deleteDirectMessage(id)
        eventBus.emit(
            'deletedDirectMessage', 
            deletedMessage
        )
    }
}