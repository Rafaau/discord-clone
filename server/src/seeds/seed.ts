import { ChatCategory } from "src/typeorm/chat-category";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatMessage } from "src/typeorm/chat-message";
import { ChatServer } from "src/typeorm/chat-server";
import { ChatServerInvitation } from "src/typeorm/chat-server-invitation";
import { DirectConversation } from "src/typeorm/direct-conversation";
import { DirectMessage } from "src/typeorm/direct-message";
import { Permission } from "src/typeorm/enums/Permission";
import { MessageReaction } from "src/typeorm/message-reaction";
import { Role } from "src/typeorm/role";
import { User } from "src/typeorm/user";
import { Repository, getRepository } from "typeorm";

export async function seedData(connection: any) {
    const userRepository: Repository<User> = connection.getRepository(User)
    const chatServerRepository: Repository<ChatServer> = connection.getRepository(ChatServer)
    const chatCategoryRepository: Repository<ChatCategory> = connection.getRepository(ChatCategory)
    const chatChannelRepository: Repository<ChatChannel> = connection.getRepository(ChatChannel)
    const roleRepository: Repository<Role> = connection.getRepository(Role)
    const directConversationRepository: Repository<DirectConversation> = connection.getRepository(DirectConversation)
    const directMessagesRepository: Repository<DirectMessage> = connection.getRepository(DirectMessage)
    const chatMessagesRepository: Repository<ChatMessage> = connection.getRepository(ChatMessage)
    const messageReactionRepository: Repository<MessageReaction> = connection.getRepository(MessageReaction)
    const chatServerInvitationRepository: Repository<ChatServerInvitation> = connection.getRepository(ChatServerInvitation)

    if (process.env.NODE_ENV.trim() == 'test') {
        await chatServerRepository.createQueryBuilder().delete().execute()
        await directConversationRepository.createQueryBuilder().delete().execute()
        await userRepository.createQueryBuilder().delete().execute()
    }

    const user1 = userRepository.create({
        id: 1,
        username: 'TestUser1',
        email: 'test@gmail.com',
        password: '$2b$10$uxKeZfzFOJj9NU85dx4xYeE1VBKKc33J2R1GxIpQdlkPSED.sZvru', // BCRYPTED 'password'
    })

    const user2 = userRepository.create({
        id: 6,
        username: 'TestUser2',
        email: 'test@gmail.com',
        password: '$2b$10$uxKeZfzFOJj9NU85dx4xYeE1VBKKc33J2R1GxIpQdlkPSED.sZvru', // BCRYPTED 'password'
        friends: [user1],
    })

    const user3 = userRepository.create({
        id: 7,
        username: 'TestUser3',
        email: 'test@gmail.com',
        password: '$2b$10$uxKeZfzFOJj9NU85dx4xYeE1VBKKc33J2R1GxIpQdlkPSED.sZvru', // BCRYPTED 'password'
        friends: [user1],
    })

    const conversation = directConversationRepository.create({
        id: 1,
        users: [user1, user2],
    })

    const existingUsers = await userRepository.find()

    if (existingUsers.length === 0) {
        await userRepository.save([user1, user2, user3])
        await directConversationRepository.save(conversation)
    }
    
    const existingChatServers = await chatServerRepository.find()

    if (existingChatServers.length === 0) {
        const chatCategory1 = chatCategoryRepository.create({
            name: 'TestChatCategory1'
        })

        const chatChannel1 = chatChannelRepository.create({
            id: 1,
            name: 'TestChatChannel1',
            index: 0,
            isPrivate: false,
        })

        const chatChannel2 = chatChannelRepository.create({
            id: 2,
            name: 'TestChatChannel2',
            index: 1,
            isPrivate: false,
        })

        const ownerRole = roleRepository.create({
            name: 'Owner',
            users: [{...user1}],
            permissions: [       
                { [Permission.Administrator]: true },
                { [Permission.ViewChannels]: true },
                { [Permission.SendMessages]: true },
            ]
        })

        const memberRole = roleRepository.create({
            name: 'Member',
            users: [{...user2}, {...user3}],
            permissions: [       
                { [Permission.Administrator]: false },
                { [Permission.ViewChannels]: true },
                { [Permission.SendMessages]: true },
            ]
        })

        await roleRepository.save([ownerRole, memberRole])

        chatCategory1.chatChannels = [chatChannel1, chatChannel2]

        const chatServer1 = chatServerRepository.create({
            id: 18,
            name: 'TestChatServer1',
            members: [user1, user2, user3],
            owner: user1,
            roles: [ownerRole, memberRole],
            chatCategories: [chatCategory1],
        })

        await chatServerRepository.save(chatServer1)
    }
}