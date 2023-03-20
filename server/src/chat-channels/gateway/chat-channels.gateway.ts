import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatChannelsService } from "../chat-channels.service";

@WebSocketGateway({ cors: { origin: ['http://localhost:4200'] } })
export class ChatChannelsGateway {
    constructor (
        private readonly chatChannelsService: ChatChannelsService
    ) {}

    @WebSocketServer()
    server: Server

    @SubscribeMessage('deleteChatChannel')
    async handleDeleteChannel(
        socket: Socket,
        id: number
    ) {
        const deletedChannel = await this.chatChannelsService
            .deleteChatChannel(id)
        if (deletedChannel.statusCode == 200)
            this.server.emit('deletedChatChannel', id)
    }
}