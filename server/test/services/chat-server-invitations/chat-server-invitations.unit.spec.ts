import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ChatServerInvitationsService } from "src/modules/chat-server-invitations/chat-server-invitations.service"
import { ChatServer } from "src/entities/chat-server"
import { ChatServerInvitation } from "src/entities/chat-server-invitation"
import { generateChatServerInvitation } from "test/controllers/chat-server-invitations/fakes-factory"
import { generateChatServer } from "test/controllers/chat-servers/fakes-factory"
import { Repository } from "typeorm"

describe('ChatServerInvitationsService', () => {
    let service: ChatServerInvitationsService
    let chatServerInvitationRepository: Repository<ChatServerInvitation>
    let chatServerRepository: Repository<ChatServer>

    const INVITATION_REPO_TOKEN = getRepositoryToken(ChatServerInvitation)
    const SERVER_REPO_TOKEN = getRepositoryToken(ChatServer)

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatServerInvitationsService,
                {
                    provide: INVITATION_REPO_TOKEN,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOneBy: jest.fn(),
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: SERVER_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                }
            ]
        }).compile()

        service = module.get<ChatServerInvitationsService>(ChatServerInvitationsService)
        chatServerInvitationRepository = module.get<Repository<ChatServerInvitation>>(INVITATION_REPO_TOKEN)
        chatServerRepository = module.get<Repository<ChatServer>>(SERVER_REPO_TOKEN)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('generateInvitation', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatServerRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.generateInvitation(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return chat server invitation', async () => {
            const expected = generateChatServerInvitation()
            jest.spyOn(chatServerRepository, 'findOneBy')
                .mockResolvedValue(generateChatServer())
            jest.spyOn(chatServerInvitationRepository, 'create')
                .mockImplementation(() => expected)
            const result = await service.generateInvitation(1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('findInvitationByUuid', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatServerInvitationRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.findInvitationByUuid('uuid')
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return chat server invitation', async () => {
            const expected = generateChatServerInvitation()
            jest.spyOn(chatServerInvitationRepository, 'findOne')
                .mockResolvedValue(expected)
            const result = await service.findInvitationByUuid('uuid')
            expect(result).toMatchObject(expected)
        })
    })

    describe('findInvitationByChatServer', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatServerInvitationRepository, 'findOneBy')
                .mockResolvedValue(null)
            const result = () => service.findInvitationByChatServer(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return chat server invitation', async () => {
            const expected = generateChatServerInvitation()
            jest.spyOn(chatServerRepository, 'findOneBy')
                .mockResolvedValue(generateChatServer())
            jest.spyOn(chatServerInvitationRepository, 'findOne')
                .mockResolvedValue(expected)
            const result = await service.findInvitationByChatServer(1)
            expect(result).toMatchObject(expected)
        })
    })
})