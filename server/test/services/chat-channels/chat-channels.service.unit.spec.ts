import { BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ChatChannelsService } from 'src/modules/chat-channels/chat-channels.service';
import { ChatCategory } from 'src/entities/chat-category';
import { ChatChannel } from 'src/entities/chat-channel';
import { ChatServer } from 'src/entities/chat-server';
import { FakeChatCategoryCreate, FakeChatChannelCreate, generateChatCategory, generateChatChannel } from 'test/controllers/chat-channels/fakes-factory';
import { Repository } from 'typeorm';

describe('ChatChannelService', () => {
    let service: ChatChannelsService;
    let chatCategoryRepository: Repository<ChatCategory>
    let chatChannelRepository: Repository<ChatChannel>
    let chatServerRepository: Repository<ChatServer>

    const CATEGORY_REPO_TOKEN = getRepositoryToken(ChatCategory)
    const CHANNEL_REPO_TOKEN = getRepositoryToken(ChatChannel)
    const SERVER_REPO_TOKEN = getRepositoryToken(ChatServer)

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatChannelsService,
                {
                    provide: CATEGORY_REPO_TOKEN,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        findOneBy: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: CHANNEL_REPO_TOKEN,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        findOneBy: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: SERVER_REPO_TOKEN,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        findOneBy: jest.fn()
                    }
                }
            ]
        }).compile()

        service = module.get<ChatChannelsService>(ChatChannelsService)
        chatCategoryRepository = module.get<Repository<ChatCategory>>(CATEGORY_REPO_TOKEN)
        chatChannelRepository = module.get<Repository<ChatChannel>>(CHANNEL_REPO_TOKEN)
        chatServerRepository = module.get<Repository<ChatServer>>(SERVER_REPO_TOKEN)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createChatChannel', () => {
        it('should return bad request exception', async () => {
            jest.spyOn(chatCategoryRepository, 'findOne')
                .mockImplementation((): any => {
                    return null
                })
            const result = () => service.createChatChannel(1, FakeChatChannelCreate.chatChannelToCreate)
            await expect(result()).rejects.toThrow(
                new HttpException('Chat category not found. Cannot create chat channel', 
                HttpStatus.BAD_REQUEST
            ))
        })

        it('should return created channel', async () => {
            const expected = FakeChatChannelCreate.createdChatChannel
            jest.spyOn(chatCategoryRepository, 'findOne')
                .mockImplementation((): any => {
                    return generateChatCategory()
                })
            jest.spyOn(chatChannelRepository, 'create')
                .mockImplementation((): any => {
                    return expected
                })
            const result = await service.createChatChannel(1, FakeChatChannelCreate.chatChannelToCreate)
            expect(result).toMatchObject(expected)
        })
    })

    describe('createChatCategory', () => {
        it('should return bad request exception', async () => {
            jest.spyOn(chatServerRepository, 'findOneBy')
                .mockImplementation((): any => {
                    return null
                })
            const result = () => service.createChatCategory(1, FakeChatCategoryCreate.chatCategoryToCreate)
            await expect(result()).rejects.toThrow(
                new HttpException('Chat server not found. Cannot create chat category', 
                HttpStatus.BAD_REQUEST
            ))
        })

        it('should return created category', async () => {
            const expected = FakeChatCategoryCreate.createdChatCategory
            jest.spyOn(chatServerRepository, 'findOneBy')
                .mockImplementation((): any => {
                    return generateChatCategory()
                })
            jest.spyOn(chatCategoryRepository, 'create')
                .mockImplementation((): any => {
                    return expected
                })
            const result = await service.createChatCategory(1, FakeChatCategoryCreate.chatCategoryToCreate)
            expect(result).toMatchObject(expected)
        })
    })

    describe('findChatChannelById', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatChannelRepository, 'findOne')
                .mockImplementation((): any => {
                    return null
                })
            const result = () => service.findChatChannelById(1)
            await expect(result()).rejects.toThrow(NotFoundException)
        })

        it('should return chat channel', async () => {
            const expected = generateChatChannel()
            jest.spyOn(chatChannelRepository, 'findOne')
                .mockImplementation((): any => {
                    return expected
                })
            const result = await service.findChatChannelById(1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('moveChannel', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatChannelRepository, 'findOne')
                .mockImplementation((): any => {
                    return null
                })
            const result = () => service.moveChannel(1, 1, 1)
            await expect(result()).rejects.toThrow(NotFoundException)
        })

        it('should return category', async () => {
            const expected = generateChatCategory()
            jest.spyOn(chatChannelRepository, 'findOne')
                .mockImplementation((): any => {
                    return generateChatChannel()
                })
            jest.spyOn(chatCategoryRepository, 'findOne')
                .mockImplementation((): any => {
                    return expected
                })
            jest.spyOn(chatCategoryRepository, 'save')
                .mockImplementation((): any => {
                    return expected
                })
            const result = await service.moveChannel(1, 1, 1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('updateChatChannel', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatChannelRepository, 'findOneBy')
                .mockImplementation((): any => {
                    return null
                })
            const result = () => service.updateChatChannel(1, FakeChatChannelCreate.chatChannelToCreate)
            await expect(result()).rejects.toThrow(NotFoundException)
        })

        it('should return updated channel', async () => {
            const expected = generateChatChannel()
            jest.spyOn(chatChannelRepository, 'findOneBy')
                .mockImplementation((): any => {
                    return generateChatChannel()
                })
            jest.spyOn(chatChannelRepository, 'save')
                .mockImplementation((): any => {
                    return expected
                })
            const result = await service.updateChatChannel(1, expected)
            expect(result).toMatchObject(expected)
        })
    })

    describe('deleteChatChannel', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatChannelRepository, 'findOneBy')
                .mockImplementation((): any => {
                    return null
                })
            const result = () => service.deleteChatChannel(1)
            await expect(result()).rejects.toThrow(NotFoundException)
        })

        it('should return OK', async () => {
            jest.spyOn(chatChannelRepository, 'findOneBy')
                .mockImplementation((): any => {
                    return generateChatChannel()
                })
            const result = await service.deleteChatChannel(1)
            expect(result).toMatchObject({
                statusCode: 200,
                message: `Chat Channel(id : ${1}) has been deleted successfully`
            })
        })
    })

    describe('deleteChatCategory', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatCategoryRepository, 'findOneBy')
                .mockImplementation((): any => {
                    return null
                })
            const result = () => service.deleteChatCategory(1)
            await expect(result()).rejects.toThrow(NotFoundException)
        })

        it('should return OK', async () => {
            jest.spyOn(chatCategoryRepository, 'findOneBy')
                .mockImplementation((): any => {
                    return generateChatCategory()
                })
            const result = await service.deleteChatCategory(1)
            expect(result).toMatchObject({
                statusCode: 200,
                message: `Chat Category(id : ${1}) has been deleted successfully`
            })
        })
    })
})