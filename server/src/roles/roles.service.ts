import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatServer } from "src/typeorm/chat-server";
import { Permission } from "src/typeorm/enums/Permission";
import { Role } from "src/typeorm/role";
import { User } from "src/typeorm/user";
import { UpdateRoleParams } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(ChatServer) private readonly chatServerRepository: Repository<ChatServer>
    ) { }

    async createRole(chatServerId: number) {
        const chatServer = await this.chatServerRepository.findOne({ 
            where: { id: chatServerId },
            relations: [
                'roles',
                'members'
            ]
        })

        if (!chatServer)
            throw new NotFoundException()
        
        const newRole = this.roleRepository.create({
            name: 'new role',
            users: [],
            permissions: [       
                { [Permission.Administrator]: false },
                { [Permission.ViewChannels]: true },
                { [Permission.SendMessages]: true },
            ]
        })

        // CHAT SERVER MEMBERS
        let userIds: string[] = []
        chatServer.members.forEach(member => {
            userIds.push(member.id.toString())
        })

        await this.roleRepository.save(newRole)
        chatServer.roles.push(newRole)
        await this.chatServerRepository.save(chatServer)
        return { newRole, userIds }
    }

    async assignMembersToRole(
        roleId: number,
        users: number[]
    ) {
        const role = await this.roleRepository.findOne({ 
            where: { id: roleId },
            relations: [
                'users',
                'chatServer',
                'chatServer.members'
            ] 
        })
        if (!role) 
            throw new NotFoundException()

        users.forEach(async id => {
            const user = await this.userRepository.findOneBy({ id })
            if (!user) 
                throw new NotFoundException()
            role.users.push(user)
        })

        // CHAT SERVER MEMBERS
        let userIds: string[] = []
        role.chatServer.members.forEach(member => {
            userIds.push(member.id.toString())
        })

        await this.roleRepository.save(role)
        return { role, userIds }
    }

    async removeMemberFromRole(
        roleId: number,
        userId: number
    ) {
        const role = await this.roleRepository.findOne({ 
            where: { id: roleId },
            relations: [
                'users',
                'chatServer',
                'chatServer.members'
            ] 
        })
        if (!role) 
            throw new NotFoundException()

        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user) 
            throw new NotFoundException()
        role.users = role.users.filter(u => u.id !== user.id)

        // CHAT SERVER MEMBERS
        let userIds: string[] = []
        role.chatServer.members.forEach(member => {
            userIds.push(member.id.toString())
        })

        await this.roleRepository.save(role)
        return { role, userIds }
    }

    async updateRole(
        roleId: number,
        roleDetails: UpdateRoleParams
    ) {
        let role = await this.roleRepository.findOne({
            where: { id: roleId },
            relations: [
                'users',
                'chatServer',
                'chatServer.members'
            ]
        })

        if (!role) 
            throw new NotFoundException()

        // CHAT SERVER MEMBERS
        let userIds: string[] = []
        role.chatServer.members.forEach(member => {
            userIds.push(member.id.toString())
        })

        role = await this.roleRepository.save({
            ...role,
            ...roleDetails
        })
        return { role, userIds }
    }

    async deleteRole(roleId: number) {
        const role = await this.roleRepository.findOne({ 
            where: { id: roleId },
            relations: [
                'chatServer',
                'chatServer.members'
            ]
        })
        if (!role) 
            throw new NotFoundException()

        // CHAT SERVER MEMBERS
        let userIds: string[] = []
        role.chatServer.members.forEach(member => {
            userIds.push(member.id.toString())
        })

        await this.roleRepository.remove(role)
        return { role, userIds }
    }
}