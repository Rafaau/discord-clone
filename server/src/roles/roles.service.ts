import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatServer } from "src/typeorm/chat-server";
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
            relations: ['roles']
        })

        if (!chatServer)
            throw new NotFoundException()
        
        const newRole = this.roleRepository.create({
            name: 'new role',
            permissions: [],
            users: []
        })

        await this.roleRepository.save(newRole)
        chatServer.roles.push(newRole)
        await this.chatServerRepository.save(chatServer)
        return newRole
    }

    async assignMembersToRole(
        roleId: number,
        userIds: number[]
    ) {
        const role = await this.roleRepository.findOne({ 
            where: { id: roleId },
            relations: ['users'] 
        })
        if (!role) 
            throw new NotFoundException()

        userIds.forEach(async id => {
            const user = await this.userRepository.findOneBy({ id })
            if (!user) 
                throw new NotFoundException()
            role.users.push(user)
        })

        await this.roleRepository.save(role)
        return role
    }

    async removeMemberFromRole(
        roleId: number,
        userId: number
    ) {
        const role = await this.roleRepository.findOne({ 
            where: { id: roleId },
            relations: ['users'] 
        })
        if (!role) 
            throw new NotFoundException()

        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user) 
            throw new NotFoundException()

        role.users = role.users.filter(u => u.id !== user.id)
        await this.roleRepository.save(role)
        return role
    }

    async updateRole(
        roleId: number,
        roleDetails: UpdateRoleParams
    ) {
        const role = await this.roleRepository.findOne({
            where: { id: roleId },
            relations: [
                'permissions',
                'users'
            ]
        })

        if (!role) 
            throw new NotFoundException()

        return await this.roleRepository.save({
            ...role,
            ...roleDetails
        })
    }

    async deleteRole(roleId: number) {
        const role = await this.roleRepository.findOneBy({ id: roleId })
        if (!role) 
            throw new NotFoundException()

        await this.roleRepository.remove(role)
        return role
    }
}