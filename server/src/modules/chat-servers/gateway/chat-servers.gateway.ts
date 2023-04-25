import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { allowedOrigins } from "src/utils/allowed-origins";
import { ChatServersService } from "../chat-servers.service";
import { Server, Socket } from "socket.io";
import eventBus from "src/utils/event-bus";

@WebSocketGateway({ cors: { origin: allowedOrigins } })
export class ChatServersGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly chatServersService: ChatServersService
    ) {
        eventBus.on('deletedChatServer', (chatServer) => {
            chatServer.members.forEach(member => {
                this.server.to(member.id.toString())
                           .emit('deletedChatServer', chatServer)
            })
        })
        eventBus.on('newChatServerMember', (chatServer) => {
            chatServer.members.forEach(member => {
                this.server.to(member.id.toString())
                           .emit('newChatServerMember', chatServer)
            })
        })
        eventBus.on('removedChatServerMember', (params) => {
            params.chatServer.members.forEach(member => {
                this.server.to(member.id.toString())
                           .emit('removedChatServerMember', params)
            })
            this.server.to(params.userId.toString())
                       .emit('removedChatServerMember', params)
        })
    }

    @WebSocketServer()
    server: Server

    handleConnection() {
    }

    handleDisconnect() {
    }

    @SubscribeMessage('deleteChatServer')
    async handleDeleteChatServer(
        socket: Socket,
        id: number
    ) {
        const deletedChatServer = await this.chatServersService
            .deleteChatServer(id)
        eventBus.emit('deletedChatServer', deletedChatServer)
    }

    @SubscribeMessage('addMemberToChatServer')
    async handleAddMemberToChatServer(
        socket: Socket,
        params: any 
    ) {
        const chatServer = await this.chatServersService
            .addMemberToChatServer(params[0], params[1])
        eventBus.emit('newChatServerMember', chatServer)
    }

    @SubscribeMessage('removeMemberFromChatServer')
    async handleRemoveMemberFromChatServer(
        socket: Socket,
        params: any
    ) {
        const chatServer = await this.chatServersService
            .removeMemberFromChatServer(params[0], params[1])
        eventBus.emit('removedChatServerMember', chatServer)
    }
}