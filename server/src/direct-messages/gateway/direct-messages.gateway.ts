import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { WebSocketServer } from "@nestjs/websockets/decorators";
import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets/interfaces";
import { Server, Socket } from "socket.io";
import { CreateDirectMessageParams } from "src/utils/types";
import { DirectMessagesService } from "../direct-messages.service";

@WebSocketGateway({ cors: { origin: ['http://localhost:4200'] } })
export class DirectMessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly directMessagesService: DirectMessagesService
    ) {}

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
        this.server.emit('newDirectMessage', message)
    }

    @SubscribeMessage('editDirectMessage')
    async handleEditMessage(
        socket: Socket,
        params: any
    ) {
        const editedMessage = await this.directMessagesService
            .updateDirectMessage(params[0], params[1])
        this.server.emit('editedDirectMessage', editedMessage)
    }

    @SubscribeMessage('deleteDirectMessage')
    async handleDeleteMessage(
        socket: Socket,
        id: number
    ) {
        const deletedMessage = await this.directMessagesService
            .deleteDirectMessage(id)
        if (deletedMessage.statusCode == 200)
            this.server.emit('deletedDirectMessage', id)
    }
}