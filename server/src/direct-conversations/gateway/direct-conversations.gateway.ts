import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { allowedOrigins } from "src/utils/allowed-origins";
import { DirectConversationsService } from "../direct-conversations.service";
import { Server, Socket } from "socket.io";
import eventBus from "src/utils/file-service/event-bus";

@WebSocketGateway({ cors: { origin: allowedOrigins } })
export class DirectConversationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly directConversationsService: DirectConversationsService
    ) {
        eventBus.on('newDirectConversation', (conversation) => {
            conversation.users.forEach(user => {
                this.server.to(user.id.toString())
                           .emit('newDirectConversation', conversation)
            })
        })
    }

    @WebSocketServer()
    server: Server
    
    handleConnection() {       
    }

    handleDisconnect() {     
    }
    
    @SubscribeMessage('createDirectConversation')
    async handleCreateDirectConversation(
        socket: Socket,
        params: any
    ) {
        const conversation = await this.directConversationsService
            .createDirectConversation(params)
        eventBus.emit('newDirectConversation', conversation)
    }
}