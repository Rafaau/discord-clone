import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatChannelsService } from "src/chat-channels/chat-channels.service";
import { allowedOrigins } from "src/utils/allowed-origins";
import eventBus from "src/utils/file-service/event-bus";

@WebSocketGateway({ cors: { origin: allowedOrigins } })
export class SignallingGateway implements OnGatewayDisconnect {
    private socketUserMap: Map<string, string> = new Map()

    constructor (
        private readonly chatChannelsService: ChatChannelsService
    ) {
        eventBus.on('joinedVoiceChannel', ({ userId, voiceChannelId, users, serverId }) => {
            const user = users.find(x => x.id == userId)
            users.forEach(x => {
                this.server.to(x.id.toString())
                           .emit('joinedVoiceChannel', { voiceChannelId, user, serverId })
            })
            
        })
        eventBus.on('leftVoiceChannel', ({ userId, voiceChannelId, users, serverId }) => {
            const user = users.find(x => x.id == userId)
            users.forEach(x => {
                this.server.to(x.id.toString())
                           .emit('leftVoiceChannel', { voiceChannelId, user, serverId })
            })
        })
    }

    @WebSocketServer()
    server: Server

    async handleDisconnect(socket: Socket) {
        const voiceConnection = this.socketUserMap.get(socket.id)
        if (voiceConnection) {
            const { voiceChannelId, userId } = this.extractIds(voiceConnection)
            await this.handleLeaveVoiceChannel(socket, { userId, voiceChannelId })
            this.socketUserMap.delete(socket.id)      
        }
    }

    @SubscribeMessage('joinVoiceChannel') 
    async handleJoinVoiceChannel(
        socket: Socket,
        params: any
    ) {
        const { userId, voiceChannelId } = params
        const { users, serverId } = await this.chatChannelsService
            .joinUserToVoiceChannel(voiceChannelId, userId)
        socket.join(`voiceChannel-${voiceChannelId}:user-${userId}`)
        eventBus.emit('joinedVoiceChannel', { userId, voiceChannelId, users, serverId })

        this.socketUserMap.set(socket.id, `voiceChannel-${voiceChannelId}:user-${userId}`)
    }

    @SubscribeMessage('leaveVoiceChannel')
    async handleLeaveVoiceChannel(
        socket: Socket,
        params: any
    ) {
        const { userId, voiceChannelId } = params
        const { users, serverId } = await this.chatChannelsService.removeUserFromVoiceChannel(voiceChannelId, userId)
        socket.leave(`voiceChannel-${voiceChannelId}:user-${userId}`)
        eventBus.emit('leftVoiceChannel', { userId, voiceChannelId, users, serverId })
    }

    extractIds(inputString: string) {
        const pattern = /^voiceChannel-(\d+):user-(\d+)$/
        const match = inputString.match(pattern)

        if (match) {
            const voiceChannelId = Number(match[1])
            const userId = Number(match[2])
            return { voiceChannelId, userId }
        }
    }
}