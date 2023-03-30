import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ChatServersService } from "src/chat-servers/chat-servers.service"
import { ChatCategory } from "src/typeorm/chat-category"
import { ChatChannel } from "src/typeorm/chat-channel"
import { ChatServer } from "src/typeorm/chat-server"
import { Role } from "src/typeorm/role"
import { User } from "src/typeorm/user"
import { FakeChatServerCreate, generateChatServer, generateFewChatServers } from "test/controllers/chat-servers/fakes-factory"
import { generateUser } from "test/controllers/users/fakes-factory"
import { Repository } from "typeorm"

describe('ChatServersService', () => {
    let service: ChatServersService
    let chatServerRepository: Repository<ChatServer>
    let chatCategoryRepository: Repository<ChatCategory>
    let chatChannelRepository: Repository<ChatChannel>
    let userRepository: Repository<User>
    let roleRepository: Repository<Role>

    const SERVER_REPO_TOKEN = getRepositoryToken(ChatServer)
    const CATEGORY_REPO_TOKEN = getRepositoryToken(ChatCategory)
    const CHANNEL_REPO_TOKEN = getRepositoryToken(ChatChannel)
    const USER_REPO_TOKEN = getRepositoryToken(User)
    const ROLE_REPO_TOKEN = getRepositoryToken(Role)

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatServersService,
                {
                    provide: SERVER_REPO_TOKEN,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOneBy: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: CATEGORY_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                },
                {
                    provide: CHANNEL_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                },
                {
                    provide: USER_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                },
                {
                    provide: ROLE_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                }
            ]
        }).compile()

        service = module.get<ChatServersService>(ChatServersService)
        chatServerRepository = module.get<Repository<ChatServer>>(SERVER_REPO_TOKEN)
        chatCategoryRepository = module.get<Repository<ChatCategory>>(CATEGORY_REPO_TOKEN)
        chatChannelRepository = module.get<Repository<ChatChannel>>(CHANNEL_REPO_TOKEN)
        userRepository = module.get<Repository<User>>(USER_REPO_TOKEN)
        roleRepository = module.get<Repository<Role>>(ROLE_REPO_TOKEN)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createChatServer', () => {
        it('should return http exception', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.createChatServer(1, FakeChatServerCreate.chatServerToCreate)
            expect(result).rejects.toThrowError(new HttpException(
                'User not found. Cannot create chat server.',
                HttpStatus.INTERNAL_SERVER_ERROR
            ))
        })

        it('should return created chat server', async () => {
            const expected = FakeChatServerCreate.createdChatServer
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(generateUser())
            jest.spyOn(chatServerRepository, 'create')
                .mockReturnValue(expected)

            const result = await service.createChatServer(1, FakeChatServerCreate.chatServerToCreate)
            expect(result).toMatchObject(expected)
        })
    })

    describe('getChatServersByUserId', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.getChatServersByUserId(1)
            expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return chat servers', async () => {
            const expected = generateFewChatServers()
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(generateUser())
            jest.spyOn(chatServerRepository, 'find')
                .mockResolvedValue(expected)

            const result = await service.getChatServersByUserId(1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('addMemberToChatServer', () => {
        it('should return http exception', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.addMemberToChatServer(1, 1)
            expect(result).rejects.toThrowError(new HttpException(
                'User not found. Cannot add to chat server.',
                HttpStatus.BAD_REQUEST
            ))
        })

        it('should return chat server', async () => {
            const expected = generateChatServer()
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(generateUser())
            jest.spyOn(chatServerRepository, 'findOne')
                .mockResolvedValue(expected)

            const result = await service.addMemberToChatServer(1, 1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('removeMemberFromChatServer', () => {
        it('should return http exception', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.removeMemberFromChatServer(1, 1)
            expect(result).rejects.toThrowError(new HttpException(
                'User not found. Cannot remove from chat server.',
                HttpStatus.BAD_REQUEST
            ))
        })

        it('should return OK', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(generateUser())
            jest.spyOn(chatServerRepository, 'findOne')
                .mockResolvedValue(generateChatServer())
            const result = await service.removeMemberFromChatServer(1, 1)
            expect(result).toMatchObject({
                statusCode: 200,
                message: `User (id: ${1}) has been successfully removed from Chat Server (id: ${1})`
            })
        })
    })

    describe('getChatServerById', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatServerRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.getChatServerById(1)
            expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return chat server', async () => {
            const expected = generateChatServer()
            jest.spyOn(chatServerRepository, 'findOne')
                .mockResolvedValue(expected)
            const result = await service.getChatServerById(1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('updateChatServer', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatServerRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.updateChatServer(1, FakeChatServerCreate.chatServerToUpdate)
            expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return updated chat server', async () => {
            const expected = generateChatServer()
            jest.spyOn(chatServerRepository, 'findOne')
                .mockResolvedValue(generateChatServer())
            jest.spyOn(chatServerRepository, 'save')
                .mockResolvedValue(expected)
            const result = await service.updateChatServer(1, FakeChatServerCreate.chatServerToUpdate)
            expect(result).toMatchObject(expected)
        })
    })

    describe('deleteChatServer', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatServerRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.deleteChatServer(1)
            expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return OK', async () => {
            jest.spyOn(chatServerRepository, 'findOneBy')
                .mockResolvedValue(generateChatServer())
            const result = await service.deleteChatServer(1)
            expect(result).toMatchObject({
                statusCode: 200,
                message: `Chat Server(id: ${1}) has been deleted successfully`
            })
        })
    })
})