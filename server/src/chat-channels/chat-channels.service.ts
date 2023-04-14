import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatCategory } from "src/typeorm/chat-category";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatServer } from "src/typeorm/chat-server";
import { CreateChatCategoryParams, CreateChatChannelParams, UpdateChatChannelParams } from "src/utils/types";
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
        const chatCategory = await this.chatCategoryRepository.findOne({
            where: { id: chatCategoryId },
            relations: [
                'chatChannels',
                'chatServer',
                'chatServer.members'
            ]
        })
        if (!chatCategory)
            throw new HttpException(
                'Chat category not found. Cannot create chat channel',
                HttpStatus.BAD_REQUEST
            )
        let index: number = 0
        let length: number = chatCategory.chatChannels.length
        switch (true) {
            case (length == 0):
                index = 0
                break
            case (length == 1):
                index = chatCategory.chatChannels[0].index + 1
                break
            case (length > 1):
                const lastIndex = chatCategory.chatChannels.sort(
                    (a, b) => a.index < b.index ? 1 : -1
                )[0].index
                index = lastIndex + 1
                break
        }
        const newChatChannel = this.chatChannelRepository.create({
            ...chatChannelDetails,
            index,
            chatCategory
        })

        // CHAT SERVER MEMBERS
        let userIds: string[] = []
        chatCategory.chatServer.members.forEach(member => {
            userIds.push(member.id.toString())
        })
        await this.chatChannelRepository.save(newChatChannel)
        return { newChatChannel, userIds }
    }

    async createChatCategory(
        chatServerId: number,
        chatCategoryDetails: CreateChatCategoryParams
    ) {
        const chatServer = await this.chatServerRepository.findOne({ 
            where: { id: chatServerId },
            relations: [
                'members'
            ]
        })
        if (!chatServer)
            throw new HttpException(
                'Chat server not found. Cannot create chat category',
                HttpStatus.BAD_REQUEST
            )
        const newChatCategory = this.chatCategoryRepository.create({
            ...chatCategoryDetails,
            chatServer
        })

        // CHAT SERVER MEMBERS
        let userIds: string[] = []
        chatServer.members.forEach(member => {
            userIds.push(member.id.toString())
        })

        await this.chatCategoryRepository.save(newChatCategory)
        return { newChatCategory, userIds }
    }

    async findChatChannelById(id: number) {
        const chatChannel = await this.chatChannelRepository.findOne({ 
            where: { id },
            relations: [
                'chatCategory',
                'chatCategory.chatServer'
            ]
        })
        if (!chatChannel)
            throw new NotFoundException()
        return chatChannel
    }

    async moveChannel(
        channelId: number,
        destinationIndex: number,
        destinationCategory: number,
    ) {
        const channel = await this.chatChannelRepository.findOne({
            where: { id: channelId },
            relations: [
                'chatCategory'
            ]
        })
        if (!channel)
            throw new NotFoundException()
        const category = await this.chatCategoryRepository.findOne({
            where: { id: destinationCategory },
            relations: [
                'chatChannels',
                'chatChannels.chatCategory',
                'chatChannels.roles',
                'chatChannels.users',
                'chatServer',
                'chatServer.members',
            ],
            order: {
                chatChannels: {
                    index: 'ASC'
                }
            }
        })
        if (!category)
            throw new NotFoundException()
        if (channel.chatCategory.id == category.id) {
            const currentChannel = category.chatChannels
                .filter(x => x.index == destinationIndex)[0]
            if (currentChannel.index > channel.index) {
                for (let i = channel.index + 1; i <= currentChannel.index; i++) {
                    category.chatChannels[i].index -= 1
                }
            } else {
                for (let i = destinationIndex; i < channel.index; i++) {
                    category.chatChannels[i].index += 1
                }
            }
            category.chatChannels[channel.index].index = destinationIndex
            category.chatChannels = category.chatChannels
                .sort((a, b) => a.index > b.index ? 1 : -1)
            for (let i = 0; i < category.chatChannels.length; i++)
                category.chatChannels[i].index = i
            return await this.chatCategoryRepository.save({
                ...category
            })
        } else {
            category.chatChannels = category.chatChannels
                .sort((a, b) => a.index > b.index ? 1 : -1)
            for (let i = 0; i < category.chatChannels.length; i++)
                category.chatChannels[i].index = i
            for (let i = destinationIndex; i < category.chatChannels.length; i++) {
               category.chatChannels[i].index += 1                                                             
            }
            channel.index = destinationIndex
            category.chatChannels.push(channel)
            category.chatChannels = category.chatChannels
                .sort((a, b) => a.index > b.index ? 1 : -1)
            for (let i = 0; i < category.chatChannels.length; i++)
                category.chatChannels[i].index = i
            return await this.chatCategoryRepository.save({
                ...category
            })
        }
    }

    async updateChatChannel(
        id: number,
        chatChannelDetails: UpdateChatChannelParams
    ) {
        const chatChannelToUpdate = await this.chatChannelRepository.findOne({ 
            where: { id },
            relations: [
                'chatCategory',
                'chatCategory.chatServer',
                'chatCategory.chatServer.members'
            ]
        })
        if (!chatChannelToUpdate)
            throw new NotFoundException()

        return await this.chatChannelRepository.save({
            ...chatChannelToUpdate,
            ...chatChannelDetails,
        })
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
        const chatChannelToDelete = await this.chatChannelRepository.findOne({ 
            where: { id },
            relations: [
                'chatCategory',
                'chatCategory.chatServer'
            ]
        })

        if (!chatChannelToDelete)
            throw new NotFoundException()

        // CHAT SERVER MEMBERS
        let userIds: string[] = []
        const chatServer = await this.chatServerRepository.findOne({
            where: { id: chatChannelToDelete.chatCategory.chatServer.id },
            relations: [
                'members'
            ]
        })
        if (chatServer) {
            chatServer.members.forEach(member => {
                userIds.push(member.id.toString())
            })
        }

        await this.chatChannelRepository.delete(chatChannelToDelete)
        return {
            chatChannelToDelete,
            userIds
        }
    }
}