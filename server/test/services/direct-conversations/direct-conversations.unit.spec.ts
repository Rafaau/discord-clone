import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { DirectConversationsService } from "src/direct-conversations/direct-conversations.service"
import { DirectConversation } from "src/typeorm/direct-conversation"
import { User } from "src/typeorm/user"
import { FakeDirectConversationCreate, generateDirectConversation, generateFewDirectConversations } from "test/controllers/direct-conversations/fakes-factory"
import { generateUser } from "test/controllers/users/fakes-factory"
import { Repository } from "typeorm"

describe('DirectConversationsService', () => {
    let service: DirectConversationsService
    let directConversationRepository: Repository<DirectConversation>
    let userRepository: Repository<User>

    const CONVERSATION_REPO_TOKEN = getRepositoryToken(DirectConversation)
    const USER_REPO_TOKEN = getRepositoryToken(User)

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DirectConversationsService,
                {
                    provide: CONVERSATION_REPO_TOKEN,
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
                }
            ]
        }).compile()

        service = module.get<DirectConversationsService>(DirectConversationsService)
        directConversationRepository = module.get<Repository<DirectConversation>>(CONVERSATION_REPO_TOKEN)
        userRepository = module.get<Repository<User>>(USER_REPO_TOKEN)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createDirectConversation', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValueOnce(null)
            const result = () => service.createDirectConversation(FakeDirectConversationCreate.directConversationToCreate)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return created conversation', async () => {
            const expected = FakeDirectConversationCreate.directConversationToCreate
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(generateUser())
            jest.spyOn(directConversationRepository, 'create')
                .mockReturnValue(FakeDirectConversationCreate.createdDirectConversation)
            const result = await service.createDirectConversation(FakeDirectConversationCreate.directConversationToCreate)
            expect(result).toMatchObject(expected)
        })
    })

    describe('findConversationsOfUser', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValueOnce(null)
            const result = () => service.findConversationsOfUser(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return conversations', async () => {
            const expected = generateFewDirectConversations()
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(generateUser())
            jest.spyOn(directConversationRepository, 'find')
                .mockResolvedValue(expected)
            const result = await service.findConversationsOfUser(1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('findConversationById', () => {
        it('should return not found exception', async () => {
            jest.spyOn(directConversationRepository, 'findOne')
                .mockResolvedValueOnce(null)
            const result = () => service.findConversationById(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return conversation', async () => {
            const expected = generateDirectConversation()
            jest.spyOn(directConversationRepository, 'findOne')
                .mockResolvedValue(expected)
            const result = await service.findConversationById(1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('deleteDirectConversation', () => {
        it('should return not found exception', async () => {
            jest.spyOn(directConversationRepository, 'findOne')
                .mockResolvedValueOnce(null)
            const result = () => service.deleteDirectConversation(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return deleted conversation', async () => {
            jest.spyOn(directConversationRepository, 'findOneBy')
                .mockResolvedValue(generateDirectConversation())
            const result = await service.deleteDirectConversation(1)
            expect(result).toMatchObject({
                statusCode: 200,
                message: `Direct Conversation(id: ${1}) has been deleted successfully`
            })
        })
    })
})