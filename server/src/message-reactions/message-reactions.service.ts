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
            const chatMessage = await this.chatMessageRepository.findOneBy({ id: chatMessageId })
            if (!chatMessage)
                throw new NotFoundException()
            const newMessageReaction = this.messageReactionRepository.create({
                ...reactionDetails,
                chatMessage,
                user: user
            })
            await this.messageReactionRepository.save(newMessageReaction)
            return newMessageReaction
        } else if (directMessageId) {
            const directMessage = await this.directMessageRepository.findOneBy({ id: directMessageId })
            if (!directMessage)
                throw new NotFoundException()
            const newMessageReaction = this.messageReactionRepository.create({
                ...reactionDetails,
                directMessage,
                user: user
            })
            await this.messageReactionRepository.save(newMessageReaction)
            return newMessageReaction
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
            message: `Message Reaction(id: ${id}) has been deleted successfully`
        }
    }
}