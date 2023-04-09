import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import eventBus from "src/utils/file-service/event-bus";
import { ChatChannelsService } from "../chat-channels.service";

@WebSocketGateway({ cors: { origin: [process.env.CLIENT_ORIGIN || 'http://localhost:4200'] } })
export class ChatChannelsGateway {
    constructor (
        private readonly chatChannelsService: ChatChannelsService
    ) {
        eventBus.on('createdChatCategory', (category) => {
            category.userIds.forEach(userId => {
                this.server.to(userId.toString())
                           .emit('createdChatCategory', category.newChatCategory)
            })
        })
        eventBus.on('createdChatChannel', (channel) => {
            channel.userIds.forEach(userId => {
                this.server.to(userId.toString())
                           .emit('createdChatChannel', channel.newChatChannel)
            })
        })
        eventBus.on('deletedChatChannel', (id, userIds) => {
            userIds.forEach(userId => {
                this.server.to(userId.toString())
                           .emit('deletedChatChannel', id)
            })
        })
        eventBus.on('updatedChatChannel', (channel) => {
            this.server.emit('updatedChatChannel', channel)
        })
    }

    @WebSocketServer()
    server: Server

    @SubscribeMessage('createChatCategory')
    async handleCreateCategory(
        socket: Socket,
        params: any
    ) {
        const category = await this.chatChannelsService
            .createChatCategory(params[0], params[1])
        eventBus.emit('createdChatCategory', category)
    }

    @SubscribeMessage('createChatChannel')
    async handleCreateChannel(
        socket: Socket,
        params: any
    ) {
        const channel = await this.chatChannelsService
            .createChatChannel(params[0], params[1])
        eventBus.emit('createdChatChannel', channel)
    }

    @SubscribeMessage('deleteChatChannel')
    async handleDeleteChannel(
        socket: Socket,
        id: number
    ) {
        const deletedChannel = await this.chatChannelsService
            .deleteChatChannel(id)
        if (deletedChannel.statusCode == 200)
            eventBus.emit('deletedChatChannel', id, deletedChannel.userIds)
    }

    @SubscribeMessage('moveChannel')
    async handleMoveChannel(
        socket: Socket,
        params: any
    ) {
        const movedChannelCategory = await this.chatChannelsService
            .moveChannel(params[0], params[1], params[2])
        let userIds: string[] = []
        movedChannelCategory.chatServer.members.forEach(member => {
            userIds.push(member.id.toString())
        })
        userIds.forEach(userId => {
            this.server.to(userId).emit('movedChannelCategory', [movedChannelCategory, params[0]])
        })
    }

    @SubscribeMessage('updateChannel')
    async handleUpdateChannel(
        socket: Socket,
        params: any
    ) {
        const updatedChannel = await this.chatChannelsService
            .updateChatChannel(params[0], params[1])
        
        let userIds: string[] = []
        updatedChannel.chatCategory.chatServer.members.forEach(member => {
            userIds.push(member.id.toString())
        })
        userIds.forEach(userId => {
            this.server.to(userId).emit('updatedChatChannel', updatedChannel)
        })
    }
}