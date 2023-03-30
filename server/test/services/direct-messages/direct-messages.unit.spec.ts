import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { DirectMessagesService } from "src/direct-messages/direct-messages.service"
import { DirectConversation } from "src/typeorm/direct-conversation"
import { DirectMessage } from "src/typeorm/direct-message"
import { User } from "src/typeorm/user"
import { generateDirectConversation } from "test/controllers/direct-conversations/fakes-factory"
import { FakeDirectMessageCreate, generateDirectMessage, generateFewDirectMessages } from "test/controllers/direct-messages/fakes-factory"
import { generateUser } from "test/controllers/users/fakes-factory"
import { Repository } from "typeorm"

describe('DirectMessagesService', () => {
    let service: DirectMessagesService
    let directMessageRepository: Repository<DirectMessage>
    let userRepository: Repository<User>
    let directConversationRepository: Repository<DirectConversation>

    const MESSAGE_REPO_TOKEN = getRepositoryToken(DirectMessage)
    const USER_REPO_TOKEN = getRepositoryToken(User)
    const CONVERSATION_REPO_TOKEN = getRepositoryToken(DirectConversation)

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DirectMessagesService,
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
                    provide: USER_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                },
                {
                    provide: CONVERSATION_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                }
            ]
        }).compile()

        service = module.get<DirectMessagesService>(DirectMessagesService)
        directMessageRepository = module.get<Repository<DirectMessage>>(MESSAGE_REPO_TOKEN)
        userRepository = module.get<Repository<User>>(USER_REPO_TOKEN)
        directConversationRepository = module.get<Repository<DirectConversation>>(CONVERSATION_REPO_TOKEN)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createDirectMessage', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValueOnce(null)
            const result = () => service.createDirectMessage(1, 1, FakeDirectMessageCreate.directMessageToCreate)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return created message', async () => {
            const expected = FakeDirectMessageCreate.createdDirectMessage
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(generateUser())
            jest.spyOn(directConversationRepository, 'findOneBy')
                .mockResolvedValue(generateDirectConversation())
            jest.spyOn(directMessageRepository, 'create')
                .mockReturnValue(expected)
            const result = await service.createDirectMessage(1, 1, FakeDirectMessageCreate.directMessageToCreate)
            expect(result).toMatchObject(expected)
        })
    })

    describe('findDirectMessagesByConversation', () => {
        it('should return not found exception', async () => {
            jest.spyOn(directConversationRepository, 'findOneBy')
                .mockResolvedValueOnce(null)
            const result = () => service.findDirectMessagesByConversation(1, 1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return messages', async () => {
            const expected = generateFewDirectMessages()
            jest.spyOn(directConversationRepository, 'findOneBy')
                .mockResolvedValue(generateDirectConversation())
            jest.spyOn(directMessageRepository, 'find')
                .mockResolvedValue(expected)
            const result = await service.findDirectMessagesByConversation(1, 1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('getSingleDirectMessage', () => {
        it('should return not found exception', async () => {
            jest.spyOn(directMessageRepository, 'findOne')
                .mockResolvedValueOnce(null)
            const result = () => service.getSingleDirectMessage(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return message', async () => {
            const expected = generateDirectMessage()
            jest.spyOn(directMessageRepository, 'findOne')
                .mockResolvedValue(expected)
            const result = await service.getSingleDirectMessage(1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('updateDirectMessage', () => {
        it('should return not found exception', async () => {
            jest.spyOn(directMessageRepository, 'findOne')
                .mockResolvedValueOnce(null)
            const result = () => service.updateDirectMessage(1, FakeDirectMessageCreate.directMessageToCreate)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return updated message', async () => {
            const expected = generateDirectMessage()
            jest.spyOn(directMessageRepository, 'findOneBy')
                .mockResolvedValue(generateDirectMessage())
            jest.spyOn(directMessageRepository, 'save')
                .mockImplementation(async () => {
                    return expected
                })
            const result = await service.updateDirectMessage(1, FakeDirectMessageCreate.directMessageToUpdate)
            expect(result).toMatchObject(expected)
        })
    })

    describe('deleteDirectMessage', () => {
        it('should return not found exception', async () => {
            jest.spyOn(directMessageRepository, 'findOneBy')
                .mockResolvedValueOnce(null)
            const result = () => service.deleteDirectMessage(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return OK', async () => {
            jest.spyOn(directMessageRepository, 'findOneBy')
                .mockResolvedValue(generateDirectMessage())
            const result = await service.deleteDirectMessage(1)
            expect(result).toMatchObject({
                statusCode: 200,
                message: `Direct Message(id: ${1}) has been deleted successfully`
            })
        })
    })
})