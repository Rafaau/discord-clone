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

    createUser(userDetails: CreateUserParams) {
        const password = encodePassword(userDetails.password)
        const newUser = this.userRepository.create({ ...userDetails, password })
        return this.userRepository.save(newUser)
    }

    findUsers() {
        return this.userRepository.find({ relations: ['friends'] })
    }

    async findUserById(id: number) {
        const user = await this.userRepository.findOneBy({ id })
        if (!user)
            throw new NotFoundException()
        return user
    }

    async updateUser(id: number, userDetails: UpdateUserParams) {
        const user = await this.userRepository.findOneBy({ id })
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
        this.userRepository.save(secondUser) 
        this.userRepository.save(firstUser)
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

    findUserByEmail(email: string) {
        return this.userRepository.findOneBy({ email })
    }

    findUsersByServer(serverId: number) {
        return this.userRepository.find({ 
            where: { chatServers: { id: serverId } } ,
            relations: [
                'managedChatServers',
                'directConversations',
                'directConversations.users'
            ]
        })
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