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
        const users: User[] = []
        for (const user of createDirectConversationDetails.users) {
            const userToPush = await this.userRepository.findOneBy({ id: user.id })
            if (!userToPush)
                throw new NotFoundException()
            else
                users.push(userToPush)
        }

        const conversations = await this.directConversationRepository
            .find({ where: {  users: users }, relations: ['users'] })
        const isAlreadyExist = conversations.find((conversation) => {
            const userIds = conversation.users.map((user) => user.id)
            return (
              userIds.length === users.length &&
              users.every((user) => userIds.includes(user.id))
            )
        })

        if (isAlreadyExist)
            throw new HttpException(
                'Conversation with provided users already exists',
                400
            )

        const newDirectConversation = this.directConversationRepository.create({
            ...createDirectConversationDetails
        })
        await this.directConversationRepository.save(newDirectConversation)
        return newDirectConversation
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
            relations: ['users']
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