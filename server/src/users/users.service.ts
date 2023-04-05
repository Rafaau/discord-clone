import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../typeorm/user";
import { comparePassword, encodePassword } from "../utils/bcrypt";
import { CreateUserParams, UpdateUserParams } from "../utils/types";
import { Repository } from "typeorm";
import { File as MulterFile } from 'multer';
import { FileService } from "src/utils/file-service/file.service";

@Injectable() 
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) {}

    async createUser(userDetails: CreateUserParams) {
        const password = encodePassword(userDetails.password)
        const newUser = this.userRepository.create({ ...userDetails, password })
        return await this.userRepository.save(newUser)
    }

    findUsers() {
        return this.userRepository.find({ relations: ['friends'] })
    }

    async findUserById(id: number) {
        const user = await this.userRepository.findOne({ 
            where: { id },
            relations: [
                'roles',
                'roles.chatServer'
            ] 
        })
        if (!user)
            throw new NotFoundException()
        return user
    }

    async updateUser(id: number, userDetails: UpdateUserParams) {
        const user = await this.userRepository.findOne({ 
            where: { id },
            relations: [
                'roles', 
                'roles.chatServer'
            ] 
        })
        if (!user)
            throw new NotFoundException()
        if (userDetails.password) 
            userDetails.password = encodePassword(userDetails.password)
        return this.userRepository.save({
            ...user,
            ...userDetails
        })
    }

    async markUsersAsFriends(firstUserId: number, secondUserId: number) {
        const firstUser = await this.userRepository.findOne({ 
            where: { id: firstUserId },
            relations: ['friends']
        })  
        const secondUser = await this.userRepository.findOne({ 
            where: { id: secondUserId },
            relations: ['friends']
        }) 
        if (!firstUser || !secondUser)
            throw new NotFoundException()
        firstUser.friends = [...firstUser.friends, {...secondUser}] 
        secondUser.friends = [...secondUser.friends, {...firstUser}] 
        await this.userRepository.save(secondUser) 
        await this.userRepository.save(firstUser)
        return {
            statusCode: 200,
            message: `User(id: ${firstUserId}) has been successfully marked as friend of User(id: ${secondUserId})`
        }    
    }

    async deleteUser(id: number) {
        const userToDelete = await this.userRepository.findOneBy({ id })
        if (!userToDelete)
            throw new NotFoundException()
        this.userRepository.delete(userToDelete)
        return {
            statusCode: 200,
            message: `User(id: ${id}) has been deleted successfully`
        }
    }

    async findUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ 
            where: { email },
            relations: [
                 'roles',
                 'roles.chatServer'
            ]
        })
        if (!user)
            throw new NotFoundException()
        return user
    }

    async findUsersByServer(serverId: number) {
        return await this.userRepository.createQueryBuilder("user")
            .innerJoin("user.chatServers", "chatServer", "chatServer.id = :serverId", { serverId })
            .leftJoinAndSelect("user.managedChatServers", "managedChatServers")
            .leftJoinAndSelect("user.directConversations", "directConversations")
            .leftJoinAndSelect("directConversations.users", "directConversationUsers")
            .leftJoinAndSelect("user.roles", "roles", "roles.chatServer = :serverId", { serverId })
            .getMany()
    }
    
    

    async findFriendsOfUser(id: number) {
        const user = await this.userRepository.findOne({ 
            where: ({ id }),
            relations: [
                'friends', 
                'friends.directConversations.users',
            ]
        })
        if (!user)
            throw new NotFoundException()
        return user.friends
    }

    async findFriendRequestsOfUser(id: number) {
        const user = await this.userRepository.findOne({
            where: ({ id }),
            relations: [
                'friendRequestsReceived',
                'friendRequestsReceived.sender'
            ]
        })
        if (!user)
            throw new NotFoundException()
        return user.friendRequestsReceived.filter(x => x.status == 'Pending')
    }

    async removeFriendshipBetweenUsers(
        firstUserId: number, 
        secondUserId: number) {
        const firstUser = await this.userRepository.findOne({ 
            where: { id: firstUserId },
            relations: ['friends']
        })
        const secondUser = await this.userRepository.findOne({
            where: { id: secondUserId },
            relations: ['friends']
        })
        if (!firstUser || !secondUser)
            throw new NotFoundException()
        firstUser.friends = firstUser.friends.filter(x => x.id != secondUserId)
        secondUser.friends = secondUser.friends.filter(x => x.id != firstUserId)
        await this.userRepository.save(firstUser)
        await this.userRepository.save(secondUser)
        return {
            statusCode: 200,
            message: `Friendship between User(id: ${firstUserId}) and User(id: ${secondUserId}) has been removed successfully`
        }
    }

    async checkIfPasswordDoesMatch(
        id: number, 
        rawPassword: string
    ) {
        const user = await this.userRepository.findOneBy({ id })
        if (!user)
            throw new NotFoundException()
        return comparePassword(rawPassword, user.password)
    }
}