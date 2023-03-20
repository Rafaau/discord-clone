import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatCategory } from "src/typeorm/chat-category";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatServer } from "src/typeorm/chat-server";
import { CreateChatCategoryParams, CreateChatChannelParams } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class ChatChannelsService {
    constructor(
        @InjectRepository(ChatChannel) private readonly chatChannelRepository: Repository<ChatChannel>,
        @InjectRepository(ChatCategory) private readonly chatCategoryRepository: Repository<ChatCategory>,
        @InjectRepository(ChatServer) private readonly chatServerRepository: Repository<ChatServer>
    ) {}

    async createChatChannel(
        chatCategoryId: number,
        chatChannelDetails: CreateChatChannelParams
    ) {
        const chatCategory = await this.chatCategoryRepository.findOneBy({ id: chatCategoryId })
        if (!chatCategory)
            throw new HttpException(
                'Chat category not found. Cannot create chat channel',
                HttpStatus.BAD_REQUEST
            )
        const newChatChannel = await this.chatChannelRepository.create({
            ...chatChannelDetails,
            chatCategory
        })
        return this.chatChannelRepository.save(newChatChannel)
    }

    async createChatCategory(
        chatServerId: number,
        chatCategoryDetails: CreateChatCategoryParams
    ) {
        const chatServer = await this.chatServerRepository.findOneBy({ id: chatServerId })
        if (!chatServer)
            throw new HttpException(
                'Chat server not found. Cannot create chat category',
                HttpStatus.BAD_REQUEST
            )
        const newChatCategory = await this.chatCategoryRepository.create({
            ...chatCategoryDetails,
            chatServer
        })
        return this.chatCategoryRepository.save(newChatCategory)
    }

    async findChatChannelById(id: number) {
        const chatChannel = await this.chatChannelRepository.findOneBy({ id })
        if (!chatChannel)
            throw new NotFoundException()
        return chatChannel
    }

    async deleteChatCategory(id: number) {
        const chatCategoryToDelete = await this.chatCategoryRepository.findOneBy({ id })
        if (!chatCategoryToDelete)
            throw new NotFoundException()
        await this.chatCategoryRepository.delete(chatCategoryToDelete)
        return {
            statusCode: 200,
            message: `Chat Category(id : ${id}) has been deleted successfully`
        }
    }

    async deleteChatChannel(id: number) {
        const chatChannelToDelete = await this.chatChannelRepository.findOneBy({ id })
        if (!chatChannelToDelete)
            throw new NotFoundException()
        await this.chatChannelRepository.delete(chatChannelToDelete)
        return {
            statusCode: 200,
            message: `Chat Channel(id : ${id}) has been deleted successfully`
        }
    }
}