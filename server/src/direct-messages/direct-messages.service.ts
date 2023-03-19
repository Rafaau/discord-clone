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
        const conversation = await this.directConversationRepository.findOneBy({ id: conversationId })
        if (!user || !conversation)
            throw new NotFoundException()
        const newDirectMessage = await this.directMessageRepository.create({
            ...createDirectMessageDetails,
            directConversation: conversation as any,
            user: user as any,
            reactions: []
        })
        return this.directMessageRepository.save(newDirectMessage)
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
        if (!firstMessage)
            throw new NotFoundException()
        if (messages.at(-1).id == firstMessage.id)
            (messages.slice(-1)[0] as any).isFirst = true
        return messages
    }

    async updateDirectMessage(id: number, messageDetails: UpdateMessageParams) {
        const messageToUpdate = await this.directMessageRepository.findOneBy({ id })
        if (!messageToUpdate)
            throw new NotFoundException()
        return this.directMessageRepository.save({
            ...messageToUpdate,
            ...messageDetails
        })
    }

    async deleteDirectMessage(id: number) {
        const messageToDelete = await this.directMessageRepository.findOneBy({ id })
        if (!messageToDelete)
            throw new NotFoundException()
        await this.directMessageRepository.delete(messageToDelete)
        return {
            statusCode: 200,
            message: `Direct Message(id: ${id}) has been deleted successfully`
        }
    }
}