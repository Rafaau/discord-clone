import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FriendRequest } from "src/entities/friend-request";
import { User } from "src/entities/user";
import { Repository } from "typeorm";

@Injectable()
export class FriendRequestsService {
    constructor (
        @InjectRepository(FriendRequest) private readonly friendRequestRepository: Repository<FriendRequest>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}

    async sendFriendRequest(
        senderId: number, 
        receiverUsername: string) {

        const sender = await this.userRepository.findOne({ 
            where: { id: senderId },
            relations: ['friends']
        })
        if (!sender)
            throw new NotFoundException()

        const receiver = await this.userRepository.findOne({ 
            where: { username: receiverUsername },
            relations: ['friends']
        })
        if (!receiver)
            return { isSuccess: false, userIds: [senderId] }

        const isAlreadyFriends = sender.friends.some(friend => friend.id === receiver.id)
        if (isAlreadyFriends)
            return { isSuccess: false, message: 'Already friends', userIds: [senderId] }

        const isAlreadySent = await this.friendRequestRepository.findOne({
            where: {
                sender,
                receiver,
                status: 'Pending'
            }
        })
        if (isAlreadySent)
            return { isSuccess: false, userIds: [senderId] }
        
        const friendRequest = this.friendRequestRepository.create({
            sender,
            receiver,
            status: 'Pending'
        })
        await this.friendRequestRepository.save(friendRequest)
        return {
            isSuccess: true,
            data: friendRequest,
            userIds: [senderId, receiver.id]
        }
    }

    async acceptFriendRequest(requestId: number) {
        const friendRequest = await this.friendRequestRepository.findOne({
            where: { id: requestId },
            relations: [
                'sender', 
                'receiver',
                'sender.friends',
                'sender.directConversations',
                'sender.directConversations.users',
                'receiver.friends',
                'receiver.directConversations',
                'receiver.directConversations.users'
            ]
        })
        if (!friendRequest)
            throw new NotFoundException()
        friendRequest.status = 'Accepted'
        await this.friendRequestRepository.save(friendRequest)
        const firstUser = friendRequest.sender
        const secondUser = friendRequest.receiver
        firstUser.friends = [...firstUser.friends, {...secondUser}] 
        secondUser.friends = [...secondUser.friends, {...firstUser}] 
        await this.userRepository.save(friendRequest.sender)
        await this.userRepository.save(friendRequest.receiver)
        return friendRequest
    }

    async declineFriendRequest(requestId: number) {
        const friendRequest = await this.friendRequestRepository.findOne({
            where: { id: requestId },
            relations: ['sender', 'receiver']
        })
        if (!friendRequest)
            throw new NotFoundException()
        friendRequest.status = 'Declined'
        await this.friendRequestRepository.save(friendRequest)
        return friendRequest
    }
    
}