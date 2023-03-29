import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import eventBus from "src/utils/file-service/event-bus";
import { ChatChannelsService } from "../chat-channels.service";

@WebSocketGateway({ cors: { origin: ['http://localhost:4200'] } })
export class ChatChannelsGateway {
    constructor (
        private readonly chatChannelsService: ChatChannelsService
    ) {
        eventBus.on('deletedChatChannel', (channel) => {
            this.server.emit('deletedChatChannel', channel)
        })
        eventBus.on('updatedChatChannel', (channel) => {
            this.server.emit('updatedChatChannel', channel)
        })
    }

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
            eventBus.emit('deletedChatChannel', deletedChannel)
    }

    @SubscribeMessage('moveChannel')
    async handleMoveChannel(
        socket: Socket,
        params: any
    ) {
        const movedChannelCategory = await this.chatChannelsService
            .moveChannel(params[0], params[1], params[2])
        this.server.emit('movedChannelCategory', [movedChannelCategory, params[0]])
    }

    @SubscribeMessage('updateChannel')
    async handleUpdateChannel(
        socket: Socket,
        params: any
    ) {
        const updatedChannel = await this.chatChannelsService
            .updateChatChannel(params[0], params[1])
        eventBus.emit('updatedChatChannel', updatedChannel)
    }
}