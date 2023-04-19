import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatChannelsService } from "src/chat-channels/chat-channels.service";
import { allowedOrigins } from "src/utils/allowed-origins";
import eventBus from "src/utils/file-service/event-bus";

@WebSocketGateway({ cors: { origin: allowedOrigins } })
export class SignallingGateway {
    constructor (
        private readonly chatChannelsService: ChatChannelsService
    ) {
        eventBus.on('joinedVoiceChannel', ({ userId, voiceChannelId, users, serverId }) => {
            const user = users.find(x => x.id == userId)
            users.forEach(x => {
                this.server.to(x.id.toString())
                           .emit('joinedVoiceChannel', { voiceChannelId, user, serverId })
            })
            console.log(`User ${userId} joined voice channel ${voiceChannelId}`)
            
        })
        eventBus.on('leftVoiceChannel', ({ userId, voiceChannelId, users, serverId }) => {
            const user = users.find(x => x.id == userId)
            users.forEach(x => {
                this.server.to(x.id.toString())
                           .emit('leftVoiceChannel', { voiceChannelId, user, serverId })
            })
            console.log(`User ${userId} left voice channel ${voiceChannelId}`)
        })
    }

    @WebSocketServer()
    server: Server

    @SubscribeMessage('joinVoiceChannel') 
    async handleJoinVoiceChannel(
        socket: Socket,
        params: any
    ) {
        const { userId, voiceChannelId } = params
        const { users, serverId } = await this.chatChannelsService.getMembersByChannelId(voiceChannelId)
        socket.join(`voiceChannel-${voiceChannelId}:user-${userId}`)
        eventBus.emit('joinedVoiceChannel', { userId, voiceChannelId, users, serverId })
    }

    @SubscribeMessage('leaveVoiceChannel')
    async handleLeaveVoiceChannel(
        socket: Socket,
        params: any
    ) {
        const { userId, voiceChannelId } = params
        const { users, serverId } = await this.chatChannelsService.getMembersByChannelId(voiceChannelId)
        socket.leave(`voiceChannel-${voiceChannelId}:user-${userId}`)
        eventBus.emit('leftVoiceChannel', { userId, voiceChannelId, users, serverId })
    }
}