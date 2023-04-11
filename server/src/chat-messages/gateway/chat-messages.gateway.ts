import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { SubscribeMessage } from "@nestjs/websockets/decorators";
import { Server } from "socket.io";
import { Socket } from "socket.io";
import { ChatMessagesService } from "../chat-messages.service";
import eventBus from "src/utils/file-service/event-bus";
import { ChatMessage } from "src/typeorm/chat-message";
import { allowedOrigins } from "src/utils/allowed-origins";

@WebSocketGateway({ cors: { origin: allowedOrigins } })
export class ChatMessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly chatMessagesService: ChatMessagesService
    ) {
        eventBus.on('newChatMessage', (message) => {
            message.userIds.forEach(id => {
                this.server.to(id)
                           .emit('newChatMessage', message.newChatMessage)
            })
        })
        eventBus.on('editedChatMessage', (message: ChatMessage) => {
            let userIds: string[] = []
            if (message.chatChannel.isPrivate) {
                message.chatChannel.users.forEach(user => {
                    userIds.push(user.id.toString())
                })
                message.chatChannel.roles.forEach(role => {
                    role.users.forEach(user => {
                        if (!userIds.includes(user.id.toString()))
                            userIds.push(user.id.toString())
                    })
                })
            } else {
                message.chatChannel.chatCategory.chatServer.members.forEach(member => {
                    userIds.push(member.id.toString())
                })
            }

            userIds.forEach(id => {
                this.server.to(id)
                           .emit('editedChatMessage', message)
            })
        })
        eventBus.on('deletedChatMessage', (params) => {
            params.userIds.forEach(id => {
                this.server.to(id)
                           .emit('deletedChatMessage', params.id)
            })
        })
    }

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
        eventBus.emit('newChatMessage', message)
    }

    @SubscribeMessage('editChatMessage')
    async handleEditMessage(
        socket: Socket,
        params: any
    ) {
        const editedMessage = await this.chatMessagesService
            .updateChatMessage(params[0], params[1])
        eventBus.emit('editedChatMessage', editedMessage)
    }

    @SubscribeMessage('deleteChatMessage')
    async handleDeleteMessage(
        socket: Socket,
        id: number
    ) {
        const deletedMessage = await this.chatMessagesService
            .deleteChatMessage(id)
        if (deletedMessage.statusCode == 200)
            eventBus.emit('deletedChatMessage', { id, userIds: deletedMessage.userIds })
    }
}