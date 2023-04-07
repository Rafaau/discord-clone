import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatMessage } from "src/typeorm/chat-message";
import { DirectMessage } from "src/typeorm/direct-message";
import { MessageReaction } from "src/typeorm/message-reaction";
import { User } from "src/typeorm/user";
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
        const reaction = await this.messageReactionRepository.findOneBy({ id })
        if (!reaction)
            throw new NotFoundException()

        await this.messageReactionRepository.delete(reaction)
        return {
            statusCode: 200,
            message: `Message Reaction(id: ${id}) has been deleted successfully`,
        }
    }
}