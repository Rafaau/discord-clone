import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { Injectable } from "@nestjs/common/decorators";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatCategory } from "src/typeorm/chat-category";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatServer } from "src/typeorm/chat-server";
import { User } from "src/typeorm/user";
import { CreateChatServerParams } from "src/utils/types";
import { Repository } from "typeorm";


@Injectable()
export class ChatServersService {
    constructor(
        @InjectRepository(ChatServer) private readonly chatServerRepository: Repository<ChatServer>,
        @InjectRepository(ChatCategory) private readonly chatCategoryRepository: Repository<ChatCategory>,
        @InjectRepository(ChatChannel) private readonly chatChannelRepository: Repository<ChatChannel>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}

    async createChatServer(userId: number, chatServerDetails: CreateChatServerParams) {
        const owner = await this.userRepository.findOneBy({ id: userId })
        const members = [{...owner}]
        if (!owner) 
            throw new HttpException(
                'User not found. Cannot create chat server.',
                HttpStatus.BAD_REQUEST
            )
        const newChatServer = this.chatServerRepository.create({
            ...chatServerDetails,
            owner, 
            members
        })
        const newChatCategory = this.chatCategoryRepository.create({
            name: 'Text channels'
        })
        const newChatChannel = this.chatChannelRepository.create({
            name: 'general'
        })
        newChatCategory.chatChannels = [{...newChatChannel}]
        newChatServer.chatCategories = [{...newChatCategory}]
        return this.chatServerRepository.save(newChatServer)
    }

    getAllChatServers() {
        return this.chatServerRepository.find({ relations: ['owner', 'members'] })
    }

    getChatServersByUserId(userId: number) {
        return this.chatServerRepository.find({
            where: { members: { id: userId }},
            relations: ['owner', 'members']
        })
    }

    async addMemberToChatServer(userId: number, chatServerId: number) {
        const member = await this.userRepository.findOneBy({ id: userId })
        if (!member)
            throw new HttpException(
                'User not found. Cannot add to chat server.',
                HttpStatus.BAD_REQUEST
            )
        const chatServer = await this.chatServerRepository.findOne({ 
            where: { id: chatServerId },
            relations: ['members'] 
        })
        if (!chatServer) 
                throw new HttpException(
                    'Chat server not found. Cannot add new member.',
                    HttpStatus.BAD_REQUEST
                );
        chatServer.members = [...chatServer.members, {...member}]
        return this.chatServerRepository.save(chatServer)
    }

    async removeMemberFromChatServer(userId: number, chatServerId: number) {
        const member = await this.userRepository.findOneBy({ id: userId })
        if (!member)
            throw new HttpException(
                'User not found. Cannot remove from chat server.',
                HttpStatus.BAD_REQUEST
            )
        const chatServer = await this.chatServerRepository.findOne({
            where: { id: chatServerId },
            relations: ['members']
        })
        if (!chatServer)
            throw new HttpException(
                'Chat server not found. Cannot remove member.',
                HttpStatus.BAD_REQUEST
            )
        var memberToDelete = chatServer.members.filter(x => x.id == member.id)
        if (!memberToDelete)
                throw new HttpException(
                    `User (id: ${userId}) is not a member of Chat Server (id: ${chatServerId})`,
                    HttpStatus.BAD_REQUEST
                )
        chatServer.members = [...chatServer.members.filter(x => x.id != member.id)]
        await this.chatServerRepository.save(chatServer)
        return {
            statusCode: 200,
            message: `User (id: ${userId}) has been successfully removed from Chat Server (id: ${chatServerId})`
        }
    }

    async getChatServerById(id: number) {
        const user = await this.chatServerRepository.findOne({
            where: { id },
            relations: [
                'chatCategories', 
                'chatCategories.chatChannels',
                'members'
            ]
        })
        if (!user)
            throw new NotFoundException()
        return user
    }

    async deleteChatServer(id: number) {
        const chatServerToDelete = await this.chatServerRepository.findOneBy({ id })
        if (!chatServerToDelete)
            throw new NotFoundException()
        await this.chatServerRepository.delete({ id })
        return {
            statusCode: 200,
            message: `Chat Server(id: ${id}) has been deleted successfully`
        }
    }
}