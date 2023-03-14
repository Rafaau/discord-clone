import { BadRequestException, HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DirectConversation } from "src/typeorm/direct-conversation";
import { User } from "src/typeorm/user";
import { CreateDirectConversationParams } from "src/utils/types";
import { And, In, Not, Repository } from "typeorm";

@Injectable()
export class DirectConversationsService {
    constructor(
        @InjectRepository(DirectConversation) private readonly directConversationRepository: Repository<DirectConversation>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}

    async createDirectConversation(createDirectConversationDetails: CreateDirectConversationParams) {
        for (const user of createDirectConversationDetails.users) {
            if (!(await this.userRepository.findOneBy({ id: user.id })))
                throw new NotFoundException()
        }

        const isAlreadyExist = await this.directConversationRepository.findOne({
            where: { users: createDirectConversationDetails.users }
        })

        if (isAlreadyExist)
            throw new HttpException(
                'Conversation with provided users already exists',
                400
            )

        const newDirectConversation = this.directConversationRepository.create({
            ...createDirectConversationDetails
        })
        return this.directConversationRepository.save(newDirectConversation)
    }

    async findConversationsOfUser(userId: number) {
        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user)
            throw new NotFoundException()
        return this.directConversationRepository.find({ 
            where: { users: [user] },
            relations: ['users'],
            relationLoadStrategy: 'query',
            order: {
                directMessages: {
                    postDate: 'desc'
                }
            }
        })
    }

    async findConversationById(id: number) {
        const conversation = await this.directConversationRepository.findOne({
            where: { id },
            order: {
                directMessages: {
                    postDate: 'asc'
                }
            },
            relations: ['users', 'directMessages', 'directMessages.user']
        })
        if (!conversation)
            throw new NotFoundException()
        return conversation
    }

    async deleteDirectConversation(id: number) {
        const conversationToDelete = await this.directConversationRepository.findOneBy({ id })
        if (!conversationToDelete)
            throw new NotFoundException()
        await this.directConversationRepository.delete(conversationToDelete)
        return {
            statusCode: 200,
            message: `Direct Conversation(id: ${id}) has been deleted successfully`
        }
    }
}