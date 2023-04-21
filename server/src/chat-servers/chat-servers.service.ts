import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { Injectable } from "@nestjs/common/decorators";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatCategory } from "src/typeorm/chat-category";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatServer } from "src/typeorm/chat-server";
import { Permission } from "src/typeorm/enums/Permission";
import { Role } from "src/typeorm/role";
import { User } from "src/typeorm/user";
import { CreateChatServerParams, UpdateChatServerParams } from "src/utils/types";
import { Repository } from "typeorm";


@Injectable()
export class ChatServersService {
    constructor(
        @InjectRepository(ChatServer) private readonly chatServerRepository: Repository<ChatServer>,
        @InjectRepository(ChatCategory) private readonly chatCategoryRepository: Repository<ChatCategory>,
        @InjectRepository(ChatChannel) private readonly chatChannelRepository: Repository<ChatChannel>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    ) {}

    async createChatServer(userId: number, chatServerDetails: CreateChatServerParams) {
        const owner = await this.findOwner(userId)
        const members = [{...owner}]
    
        const newChatServer = this.chatServerRepository.create({
            ...chatServerDetails,
            owner,
            members
        })
    
        const newChatCategory = this.createChatCategory()
        const newChatChannel = this.createChatChannel()
    
        const [ownerRole, memberRole] = await this.createRoles(owner)
    
        newChatCategory.chatChannels = [{...newChatChannel}]
        newChatServer.chatCategories = [{...newChatCategory}]
        newChatServer.roles = [ownerRole, memberRole]
    
        try {
            await this.chatServerRepository.save(newChatServer)
            return newChatServer
        } catch (e) {
            console.log(e)
            throw new HttpException(
                'Error while creating chat server',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    } 
    
    getAllChatServers() {
        return this.chatServerRepository.find({ relations: ['owner', 'members'] })
    }

    async getChatServersByUserId(userId: number) {
        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user)
            throw new NotFoundException()
        return await this.chatServerRepository.find({
            where: { members: { id: userId }},
            relations: [
                'owner', 
                'members',
            ]
        })
    }

    async getChatServerInvitationDetails(id: number) {
        const chatServer = await this.chatServerRepository.findOne({
            where: { id },
            relations: ['members']
        })
        if (!chatServer)
            throw new HttpException(
                'Chat server not found',
                HttpStatus.BAD_REQUEST
            )
        return chatServer
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
            relations: [
                'members',
                'roles',
            ] 
        })
        if (!chatServer) 
                throw new HttpException(
                    'Chat server not found. Cannot add new member.',
                    HttpStatus.BAD_REQUEST
                );
        chatServer.members = [...chatServer.members, {...member}]
        const memberRole = await this.roleRepository.findOne({ 
            where: { id: chatServer.roles.find(x => x.name == 'Member').id },
            relations: ['users']
        })
        memberRole.users.push(member)
        await this.roleRepository.save(memberRole)
        await this.chatServerRepository.save(chatServer)
        return chatServer
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
            chatServer,
            userId
        }
    }

    async getChatServerById(id: number) {
        const chatServer = await this.chatServerRepository.findOne({
            where: { id },
            relations: [
                'chatCategories', 
                'chatCategories.chatChannels',
                'chatCategories.chatChannels.chatCategory',
                'chatCategories.chatChannels.users',
                'chatCategories.chatChannels.roles',
                'chatCategories.chatChannels.voiceUsers',
                'members',
                'members.roles',
                'roles',
                'roles.users',
            ],
            order: {
                chatCategories: {
                    id: 'ASC',
                    chatChannels: { index: 'ASC' }
                }
            }
        })
        if (!chatServer)
            throw new NotFoundException()
        return chatServer
    }

    async updateChatServer(
        id: number, 
        serverDetails: UpdateChatServerParams
    ) {
        const chatServer = await this.chatServerRepository.findOne({ 
            where: { id },
            relations: [
                'chatCategories',
                'chatCategories.chatChannels',
                'roles',
                'roles.users',
                'members',
                'members.roles',
                'chatCategories.chatChannels.roles',
                'chatCategories.chatChannels.users',
            ] 
        })

        if (!chatServer)
            throw new NotFoundException()
        return this.chatServerRepository.save({
            ...chatServer,
            ...serverDetails
        })
    }

    async deleteChatServer(id: number) {
        const chatServerToDelete = await this.chatServerRepository.findOne({ 
            where: { id },
            relations: [
                'members'
            ]
        })
        if (!chatServerToDelete)
            throw new NotFoundException()
        try {
            await this.chatServerRepository.delete({ id })
            return chatServerToDelete
        } catch (e) {
            throw new HttpException(
                'Error while deleting chat server', 
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    async findOwner(userId: number) {
        const owner = await this.userRepository.findOneBy({ id: userId })
        if (!owner) {
            throw new HttpException(
                'User not found. Cannot create chat server.',
                HttpStatus.BAD_REQUEST
            )
        }
        return owner
    }
    
    createChatCategory() {
        return this.chatCategoryRepository.create({
            name: 'Text channels'
        })
    }
    
    createChatChannel() {
        return this.chatChannelRepository.create({
            name: 'general',
            index: 0,
            isPrivate: false,
        })
    }
    
    async createRoles(owner: User) {
        const ownerRole = this.roleRepository.create({
            name: 'Owner',
            users: [{...owner}],
            permissions: [       
                { [Permission.Administrator]: true },
                { [Permission.ViewChannels]: true },
                { [Permission.SendMessages]: true },
            ]
        })

        const memberRole = this.roleRepository.create({
            name: 'Member',
            permissions: [       
                { [Permission.Administrator]: false },
                { [Permission.ViewChannels]: true },
                { [Permission.SendMessages]: true },
            ]
        })
    
        await this.roleRepository.save([ownerRole, memberRole])
    
        return [ownerRole, memberRole]
    }
}