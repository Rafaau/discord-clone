import { ArgumentMetadata, HttpStatus, NotFoundException, ValidationPipe } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { Response } from "express"
import { createResponse, MockResponse } from "node-mocks-http"
import { ChatChannelsController } from "src/chat-channels/chat-channels.controller"
import { CreateChatCategoryDto, CreateChatChannelDto } from "src/chat-channels/chat-channels.dto"
import { ChatChannelsService } from "src/modules/chat-channels/chat-channels.service"
import { FakeChatCategoryCreate, FakeChatChannelCreate, generateChatCategory, generateChatChannel } from "./fakes-factory"

describe('ChatChannelsController', () => {
    let controller: ChatChannelsController
    let service: ChatChannelsService
    let response: MockResponse<Response>

    let target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true })
    const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: CreateChatChannelDto,
        data: ''
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatChannelsController],
            providers: [
                {
                    provide: ChatChannelsService,
                    useValue: {
                        createChatChannel: jest.fn((x) => x),
                        createChatCategory: jest.fn((x) => x),
                        findChatChannelById: jest.fn((x) => x),
                        deleteChatCategory: jest.fn((x) => x)
                    }
                }
            ]
        }).compile()

        controller = module.get<ChatChannelsController>(ChatChannelsController)
        service = module.get<ChatChannelsService>(ChatChannelsService)
        response = createResponse()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('createChatChannel', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'createChatChannel')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.createChatChannel(1, FakeChatChannelCreate.chatChannelToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return chat channel', async () => {
            const fakeChatChannel = generateChatChannel()
            jest.spyOn(service, 'createChatChannel')
                .mockImplementation(async () => {
                    return fakeChatChannel
                })
            await controller.createChatChannel(1, FakeChatChannelCreate.chatChannelToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.CREATED)
            expect(response._getJSONData()).toMatchObject(fakeChatChannel)
        })

        it('should return validation error', async () => {
            await target.transform(<CreateChatChannelDto>FakeChatChannelCreate.invalidChatChannelReq, metadata)
                .catch(err => {
                    expect(err.getResponse().statusCode).toBe(HttpStatus.BAD_REQUEST)
                    expect(err.getResponse().message).toEqual(['name should not be empty'])
                })
        })
    })

    describe('createChatCategory', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'createChatCategory')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.createChatCategory(1, FakeChatCategoryCreate.chatCategoryToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe("Not Found")
        })

        it('should return chat category', async () => {
            const fakeChatCategory = generateChatCategory()
            jest.spyOn(service, 'createChatCategory')
                .mockImplementation(async () => {
                    return fakeChatCategory
                })
            await controller.createChatCategory(1, FakeChatCategoryCreate.chatCategoryToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.CREATED)
            expect(response._getJSONData()).toMatchObject(fakeChatCategory)
        })

        it('should return validation error', async () => {
            const metadata: ArgumentMetadata = {
                type: 'body',
                metatype: CreateChatCategoryDto,
                data: ''
            }
            await target.transform(<CreateChatCategoryDto>FakeChatCategoryCreate.invalidChatCategoryReq, metadata)
                .catch(err => {
                    expect(err.getResponse().statusCode).toBe(HttpStatus.BAD_REQUEST)
                    expect(err.getResponse().message).toEqual(['name should not be empty'])
                })
        })
    })

    describe('getChatChannel', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'findChatChannelById')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.getChatChannel(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe("Not Found")
        })

        it('should return chat channel', async () => {
            const fakeChatChannel = generateChatChannel()
            jest.spyOn(service, 'findChatChannelById')
                .mockImplementation(async () => {
                    return fakeChatChannel
                })
            await controller.getChatChannel(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject(fakeChatChannel)
        })
    })

    describe('deleteChatCategory', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'deleteChatCategory')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.deleteChatCategory(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return ok', async () => {
            jest.spyOn(service, 'deleteChatCategory')
                .mockImplementation(async (id: number) => {
                    return {
                        statusCode: 200,
                        message: `Chat Category(id : ${id}) has been deleted successfully`
                    }
                })
            await controller.deleteChatCategory(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData().statusCode).toBe(200)
            expect(response._getJSONData().message).toBe('Chat Category(id : 1) has been deleted successfully')
        })
    })
})