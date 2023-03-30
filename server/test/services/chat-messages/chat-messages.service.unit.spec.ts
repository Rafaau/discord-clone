import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ChatMessagesService } from "src/chat-messages/chat-messages.service"
import { ChatChannel } from "src/typeorm/chat-channel"
import { ChatMessage } from "src/typeorm/chat-message"
import { MessageReaction } from "src/typeorm/message-reaction"
import { User } from "src/typeorm/user"
import { generateChatChannel } from "test/controllers/chat-channels/fakes-factory"
import { FakeChatMessageCreate, generateChatMessage, generateFewChatMessages } from "test/controllers/chat-messages/fakes-factory"
import { generateUser } from "test/controllers/users/fakes-factory"
import { Repository } from "typeorm"

describe('ChatMessageService', () => {
    let service: ChatMessagesService
    let chatMessageRepository: Repository<ChatMessage>
    let chatChannelRepository: Repository<ChatChannel>
    let userRepository: Repository<User>
    let reactionRepository: Repository<MessageReaction>

    const MESSAGE_REPO_TOKEN = getRepositoryToken(ChatMessage)
    const CHANNEL_REPO_TOKEN = getRepositoryToken(ChatChannel)
    const USER_REPO_TOKEN = getRepositoryToken(User)
    const REACTION_REPO_TOKEN = getRepositoryToken(MessageReaction)

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatMessagesService,
                {
                    provide: MESSAGE_REPO_TOKEN,
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
                    provide: REACTION_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                }
            ]
        }).compile()

        service = module.get<ChatMessagesService>(ChatMessagesService)
        chatMessageRepository = module.get<Repository<ChatMessage>>(MESSAGE_REPO_TOKEN)
        chatChannelRepository = module.get<Repository<ChatChannel>>(CHANNEL_REPO_TOKEN)
        userRepository = module.get<Repository<User>>(USER_REPO_TOKEN)
        reactionRepository = module.get<Repository<MessageReaction>>(REACTION_REPO_TOKEN)
    }) 

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createChatMessage', () => {
        it('should return bad request exception', async () => {
            jest.spyOn(chatChannelRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.createChatMessage(1, 1, FakeChatMessageCreate.chatMessageToCreate)
            await expect(result()).rejects.toThrowError(new HttpException(
                'Chat channel not found. Cannot create chat message.',
                HttpStatus.BAD_REQUEST
            ))
        })

        it('should return created message', async () => {
            const expected = FakeChatMessageCreate.createdChatMessage
            jest.spyOn(chatChannelRepository, 'findOneBy')
                .mockResolvedValue(generateChatChannel())
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(generateUser())
            jest.spyOn(chatMessageRepository, 'create')
                .mockImplementation(() => {
                    return expected
                })
            const result = await service.createChatMessage(1, 1, FakeChatMessageCreate.chatMessageToCreate)
            expect(result).toMatchObject(expected)
        })
    })

    describe('findChatMessagesByChannelId', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatChannelRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.findChatMessagesByChannelId(1, 1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return chat messages', async () => {
            const expected = generateFewChatMessages()
            jest.spyOn(chatChannelRepository, 'findOneBy')
                .mockResolvedValue(generateChatChannel())
            jest.spyOn(chatMessageRepository, 'find')
                .mockResolvedValue(expected)
            const result = await service.findChatMessagesByChannelId(1, 1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('getSingleChatMessage', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatMessageRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.getSingleChatMessage(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return chat message', async () => {
            const expected = generateChatMessage()
            jest.spyOn(chatMessageRepository, 'findOne')
                .mockResolvedValue(expected)
            const result = await service.getSingleChatMessage(1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('updateChatMessage', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatMessageRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.updateChatMessage(1, FakeChatMessageCreate.chatMessageToUpdate)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return updated chat message', async () => {
            const expected = generateChatMessage()
            jest.spyOn(chatMessageRepository, 'findOneBy')
                .mockResolvedValue(generateChatMessage())
            jest.spyOn(chatMessageRepository, 'save')
                .mockImplementation(async () => {
                    return expected
                })
            const result = await service.updateChatMessage(1, FakeChatMessageCreate.chatMessageToUpdate)
            expect(result).toMatchObject(expected)
        })
    })

    describe('deleteChatMessage', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatMessageRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.deleteChatMessage(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return OK', async () => {
            jest.spyOn(chatMessageRepository, 'findOneBy')
                .mockResolvedValue(generateChatMessage())
            const result = await service.deleteChatMessage(1)
            expect(result).toMatchObject({
                statusCode: 200,
                message: `Chat Message(id: ${1}) has been deleted successfully`
            })
        })
    })
})