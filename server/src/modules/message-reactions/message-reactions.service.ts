import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatMessage } from "src/entities/chat-message";
import { DirectMessage } from "src/entities/direct-message";
import { MessageReaction } from "src/entities/message-reaction";
import { User } from "src/entities/user";
import { CreateMessageReactionParams } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class MessageReactionsService {
    constructor(
        @InjectRepository(MessageReaction) private readonly messageReactionRepository: Repository<MessageReaction>,
        @InjectRepository(ChatMessage) private readonly chatMessageRepository: Repository<ChatMessage>,
        @InjectRepository(DirectMessage) private readonly directMessageRepository: Repository<DirectMessage>,
        @InjectRepository(User) private readonly userRepository: Repository<User> 
    ) {}

    async createMessageReaction(
        reactionDetails: CreateMessageReactionParams,
        userId: number,
        chatMessageId?: number,
        directMessageId?: number
    ) {
        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user)
            throw new NotFoundException()
        if (chatMessageId) {
            const chatMessage = await this.chatMessageRepository.findOne({ 
                where: { id: chatMessageId },
                relations: [
                    'chatChannel', 
                    'chatChannel.users',
                    'chatChannel.roles',
                    'chatChannel.chatCategory',
                    'chatChannel.chatCategory.chatServer',
                    'chatChannel.chatCategory.chatServer.members'
                ] 
            })
            if (!chatMessage)
                throw new NotFoundException()
            const newMessageReaction = this.messageReactionRepository.create({
                ...reactionDetails,
                chatMessage,
                user: user
            })

            // CHAT CHANNEL USERS
            let userIds: string[] = []
            if (chatMessage.chatChannel.isPrivate) {
                chatMessage.chatChannel.users.forEach(user => {
                    userIds.push(user.id.toString())
                })
                chatMessage.chatChannel.roles.forEach(role => {
                    role.users.forEach(user => {
                        if (!userIds.includes(user.id.toString()))
                            userIds.push(user.id.toString())
                    })
                })
            } else {
                chatMessage.chatChannel.chatCategory.chatServer.members.forEach(user => {
                    userIds.push(user.id.toString())
                })
            }

            await this.messageReactionRepository.save(newMessageReaction)
            return { newMessageReaction, userIds }
        } else if (directMessageId) {
            const directMessage = await this.directMessageRepository.findOne({ 
                where: { id: directMessageId },
                relations: [
                    'directConversation',
                    'directConversation.users'
                ]
            })
            if (!directMessage)
                throw new NotFoundException()
            const newMessageReaction = this.messageReactionRepository.create({
                ...reactionDetails,
                directMessage,
                user: user
            })

            // DIRECT MESSAGE USERS
            let userIds: string[] = []
            directMessage.directConversation.users.forEach(user => {
                userIds.push(user.id.toString())
            })

            await this.messageReactionRepository.save(newMessageReaction)
            return { newMessageReaction, userIds }
        } else
            throw new NotFoundException()
    }

    async deleteReaction(id: number) {
        const reaction = await this.messageReactionRepository.findOne({ 
            where: { id },
            relations: [
                'directMessage',
                'directMessage.directConversation',
                'directMessage.directConversation.users',
                'chatMessage',
                'chatMessage.chatChannel',
                'chatMessage.chatChannel.chatCategory',
                'chatMessage.chatChannel.chatCategory.chatServer',
                'chatMessage.chatChannel.chatCategory.chatServer.members',
                'user',
            ]
        })
        if (!reaction)
            throw new NotFoundException()

        let userIds: string[] = []
        if (reaction.directMessage) {
            // DIRECT MESSAGE USERS
            reaction.directMessage.directConversation.users.forEach(user => {
                userIds.push(user.id.toString())
            })
        } else if (reaction.chatMessage) {
            // CHAT SERVER USERS
            reaction.chatMessage.chatChannel.chatCategory.chatServer.members.forEach(user => {
                userIds.push(user.id.toString())
            })
        }
        await this.messageReactionRepository.delete({ id: reaction.id })
        return {
            reaction,
            userIds
        }
    }
}