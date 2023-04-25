import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatChannel } from "src/entities/chat-channel";
import { ChatMessage } from "src/entities/chat-message";
import { MessageReaction } from "src/entities/message-reaction";
import { User } from "src/entities/user";
import { CreateChatMessageParams, UpdateMessageParams } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class ChatMessagesService {
    constructor(
        @InjectRepository(ChatMessage) private readonly chatMessageRepository: Repository<ChatMessage>,
        @InjectRepository(ChatChannel) private readonly chatChannelRepository: Repository<ChatChannel>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(MessageReaction) private readonly reactionRepository: Repository<MessageReaction>
    ) {}

    async createChatMessage(
        chatChannelId: number, 
        userId: number,
        chatMessageDetails: CreateChatMessageParams
    ) {
        const chatChannel = await this.chatChannelRepository.findOne({ 
            where: { id: chatChannelId },
            relations: [
                'users',
                'roles',
                'chatCategory',
                'chatCategory.chatServer',
                'chatCategory.chatServer.members'
            ]
        })
        if (!chatChannel)
            throw new HttpException(
                'Chat channel not found. Cannot create chat message.',
                HttpStatus.BAD_REQUEST
            )
        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user)
            throw new HttpException(
                'User not found. Cannot create chat message.',
                HttpStatus.BAD_REQUEST
            )
        const newChatMessage = this.chatMessageRepository.create({
            ...chatMessageDetails,
            chatChannel,
            user,
            reactions: []
        })

        // CHAT CHANNEL USERS
        let userIds: string[] = []
        if (chatChannel.isPrivate) {
            chatChannel.users.forEach(user => {
                userIds.push(user.id.toString())
            })
            chatChannel.roles.forEach(role => {
                role.users.forEach(user => {
                    if (!userIds.includes(user.id.toString()))
                        userIds.push(user.id.toString())
                })
            })
        } else {
            chatChannel.chatCategory.chatServer.members.forEach(member => {
                userIds.push(member.id.toString())
            })
        }

        await this.chatMessageRepository.save(newChatMessage)
        return { newChatMessage, userIds }
    }

    async findChatMessagesByChannelId(channelId: number, page: number) {
        const chatChannel = await this.chatChannelRepository.findOneBy({ id: channelId })
        if (!chatChannel)
            throw new NotFoundException()
        const messages = await this.chatMessageRepository.find({
            where: {
                chatChannel: chatChannel
            },
            order: { postDate: 'DESC' },
            skip: (page - 1) * 10,
            take: 10,
            relations: [
                'user', 
                'chatChannel',
                'reactions',
                'reactions.chatMessage',
                'reactions.user'
            ]
        })
        const firstMessage = await this.chatMessageRepository.findOne({
            where: { chatChannel: chatChannel },
            order: { id: 'ASC' }
        })
        if (firstMessage && messages.at(-1).id == firstMessage.id)
            (messages.slice(-1)[0] as any).isFirst = true
        return messages
    }

    async getSingleChatMessage(id: number) {
        const message = await this.chatMessageRepository.findOne({
            where: { id },
            relations: ['user']
        })
        if (!message)
            throw new NotFoundException()
        return message
    }

    async updateChatMessage(id: number, messageDetails: UpdateMessageParams) {
        const chatMessageToUpdate = await this.chatMessageRepository.findOne({ 
            where: { id },
            relations: [
                'chatChannel',
                'chatChannel.users',
                'chatChannel.roles',
                'chatChannel.roles.users',
                'chatChannel.chatCategory',
                'chatChannel.chatCategory.chatServer',
                'chatChannel.chatCategory.chatServer.members',
                'user',
                'reactions',
                'reactions.user',
            ] 
        })
        if (!chatMessageToUpdate)
            throw new NotFoundException()
        return await this.chatMessageRepository.save({
            ...chatMessageToUpdate,
            ...messageDetails
        })
    }

    async deleteChatMessage(id: number) {
        const chatMessageToDelete = await this.chatMessageRepository.findOne({ 
            where: { id },
            relations: [
                'chatChannel',
                'chatChannel.users',
                'chatChannel.roles',
                'chatChannel.roles.users',
                'chatChannel.chatCategory',
                'chatChannel.chatCategory.chatServer',
                'chatChannel.chatCategory.chatServer.members'
            ]
        })
        if (!chatMessageToDelete)
            throw new NotFoundException()

        // CHAT CHANNEL USERS
        let userIds: string[] = []
        if (chatMessageToDelete.chatChannel.isPrivate) {
            chatMessageToDelete.chatChannel.users.forEach(user => {
                userIds.push(user.id.toString())
            })
            chatMessageToDelete.chatChannel.roles.forEach(role => {
                role.users.forEach(user => {
                    if (!userIds.includes(user.id.toString()))
                        userIds.push(user.id.toString())
                })
            })
        } else {
            chatMessageToDelete.chatChannel.chatCategory.chatServer.members.forEach(member => {
                userIds.push(member.id.toString())
            })
        }

        await this.chatMessageRepository.delete(chatMessageToDelete.id)
        return {
            chatMessageToDelete,
            userIds
        }
    }
}