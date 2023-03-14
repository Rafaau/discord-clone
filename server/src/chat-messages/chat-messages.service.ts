import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatMessage } from "src/typeorm/chat-message";
import { User } from "src/typeorm/user";
import { CreateChatMessageParams, UpdateMessageParams } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class ChatMessagesService {
    constructor(
        @InjectRepository(ChatMessage) private readonly chatMessageRepository: Repository<ChatMessage>,
        @InjectRepository(ChatChannel) private readonly chatChannelRepository: Repository<ChatChannel>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}

    async createChatMessage(
        chatChannelId: number, 
        userId: number,
        chatMessageDetails: CreateChatMessageParams
    ) {
        const chatChannel = await this.chatChannelRepository.findOneBy({ id: chatChannelId })
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
        const newChatMessage = await this.chatMessageRepository.create({
            ...chatMessageDetails,
            chatChannel,
            user
        })
        return this.chatMessageRepository.save(newChatMessage)
    }

    async findChatMessagesByChannelId(channelId: number) {
        const chatChannel = await this.chatChannelRepository.findOneBy({ id: channelId })
        if (!chatChannel)
            throw new NotFoundException()
        return this.chatMessageRepository.find({
            where: {
                chatChannel: chatChannel
            },
            relations: ['user']
        })
    }

    async updateChatMessage(id: number, messageDetails: UpdateMessageParams) {
        const chatMessageToUpdate = await this.chatMessageRepository.findOneBy({ id })
        if (!chatMessageToUpdate)
            throw new NotFoundException()
        await this.chatMessageRepository.update(chatMessageToUpdate, { ...messageDetails })
        return {
            statusCode: 200,
            message: `Chat Message(id: ${id}) has been updated successfully`
        }
    }

    async deleteChatMessage(id: number) {
        const chatMessageToDelete = await this.chatMessageRepository.findOneBy({ id })
        if (!chatMessageToDelete)
            throw new NotFoundException()
        await this.chatMessageRepository.delete(chatMessageToDelete)
        return {
            statusCode: 200,
            message: `Chat Message(id: ${id}) has been deleted successfully`
        }
    }
}