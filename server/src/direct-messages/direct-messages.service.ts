import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DirectConversation } from "src/typeorm/direct-conversation";
import { DirectMessage } from "src/typeorm/direct-message";
import { User } from "src/typeorm/user";
import { CreateDirectMessageParams, UpdateMessageParams } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class DirectMessagesService {
    constructor(
        @InjectRepository(DirectMessage) private readonly directMessageRepository: Repository<DirectMessage>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(DirectConversation) private readonly directConversationRepository: Repository<DirectConversation>
    ) {}

    async createDirectMessage(
        conversationId: number,
        userId: number,
        createDirectMessageDetails: CreateDirectMessageParams
    ) {
        const user = await this.userRepository.findOneBy({ id: userId })
        const conversation = await this.directConversationRepository.findOne({ 
            where: { id: conversationId },
            relations: ['users'] 
        })
        if (!user || !conversation)
            throw new NotFoundException()
        const newDirectMessage = this.directMessageRepository.create({
            ...createDirectMessageDetails,
            directConversation: conversation as any,
            user: user as any,
            reactions: []
        })
        await this.directMessageRepository.save(newDirectMessage)
        return newDirectMessage
    }

    async findDirectMessagesByConversation(conversationId: number, page: number) {
        const conversation = await this.directConversationRepository.findOneBy({ id: conversationId })
        if (!conversation)
            throw new NotFoundException()
        const messages = await this.directMessageRepository.find({
            where: { directConversation: conversation },
            order: { postDate: 'DESC' },
            skip: (page - 1) * 10,
            take: 10,
            relations: [
                'user', 
                'directConversation', 
                'directConversation.users',
                'reactions',
                'reactions.directMessage',
                'reactions.user'
            ]
        })
        const firstMessage = await this.directMessageRepository.findOne({
            where: { directConversation: conversation },
            order: { id: 'ASC' }
        })
        if (firstMessage && messages.at(-1).id == firstMessage.id)
            (messages.slice(-1)[0] as any).isFirst = true
        return messages
    }

    async getSingleDirectMessage(id: number) {
        const message = await this.directMessageRepository.findOne({
            where: { id },
            relations: ['user']
        })
        if (!message)
            throw new NotFoundException()
        return message
    }

    async updateDirectMessage(id: number, messageDetails: UpdateMessageParams) {
        const messageToUpdate = await this.directMessageRepository.findOne({ 
            where: { id },
            relations: [
                'directConversation',
                'directConversation.users',
                'user',
                'reactions',
                'reactions.user'
            ]
        })
        if (!messageToUpdate)
            throw new NotFoundException()
        return await this.directMessageRepository.save({
            ...messageToUpdate,
            ...messageDetails
        })
    }

    async deleteDirectMessage(id: number) {
        const messageToDelete = await this.directMessageRepository.findOne({ 
            where: { id },
            relations: [
                'directConversation',
                'directConversation.users',
            ]
        })
        if (!messageToDelete)
            throw new NotFoundException()

        await this.directMessageRepository.delete(messageToDelete)
        return messageToDelete
    }
}