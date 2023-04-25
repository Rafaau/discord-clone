import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { MessageReactionsService } from "src/message-reactions/message-reactions.service"
import { ChatMessage } from "src/entities/chat-message"
import { DirectMessage } from "src/entities/direct-message"
import { MessageReaction } from "src/entities/message-reaction"
import { User } from "src/entities/user"
import { generateChatMessage } from "test/controllers/chat-messages/fakes-factory"
import { generateUser } from "test/controllers/users/fakes-factory"
import { Repository } from "typeorm"
import { FakeMessageReactionCreate } from "./fakes-factory"

describe('MessageReactionsService', () => {
    let service: MessageReactionsService
    let messageReactionRepository: Repository<MessageReaction>
    let chatMessageRepository: Repository<ChatMessage>
    let directMessageRepository: Repository<DirectMessage>
    let userRepository: Repository<User>

    const REACTION_REPO_TOKEN = getRepositoryToken(MessageReaction)
    const CHAT_MESSAGE_REPO_TOKEN = getRepositoryToken(ChatMessage)
    const DIRECT_MESSAGE_REPO_TOKEN = getRepositoryToken(DirectMessage)
    const USER_REPO_TOKEN = getRepositoryToken(User)
    
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessageReactionsService,
                {
                    provide: REACTION_REPO_TOKEN,
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
                    provide: CHAT_MESSAGE_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                },
                {
                    provide: DIRECT_MESSAGE_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                },
                {
                    provide: USER_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                }
            ]
        }).compile()

        service = module.get<MessageReactionsService>(MessageReactionsService)
        messageReactionRepository = module.get<Repository<MessageReaction>>(REACTION_REPO_TOKEN)
        chatMessageRepository = module.get<Repository<ChatMessage>>(CHAT_MESSAGE_REPO_TOKEN)
        directMessageRepository = module.get<Repository<DirectMessage>>(DIRECT_MESSAGE_REPO_TOKEN)
        userRepository = module.get<Repository<User>>(USER_REPO_TOKEN)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createMessageReaction', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.createMessageReaction(FakeMessageReactionCreate.messageReactionToCreate, 1, 1, 1)
            await expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return created reaction', async () => {
            const expected = FakeMessageReactionCreate.createdMessageReaction
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(generateUser())
            jest.spyOn(chatMessageRepository, 'findOneBy')
                .mockResolvedValue(generateChatMessage())
            jest.spyOn(messageReactionRepository, 'create')
                .mockImplementation(() => {
                    return expected
                })
            const result = await service.createMessageReaction(FakeMessageReactionCreate.messageReactionToCreate, 1, 1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('deleteReaction', () => {
        it('should return not found exception', async () => {
            jest.spyOn(messageReactionRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.deleteReaction(1)
            await expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return OK', async () => {
            jest.spyOn(messageReactionRepository, 'findOneBy')
                .mockResolvedValue(FakeMessageReactionCreate.createdMessageReaction)
            const result = await service.deleteReaction(1)
            expect(result).toMatchObject({
                statusCode: 200,
                message: `Message Reaction(id: ${1}) has been deleted successfully`
            })
        })
    })
})