import { ArgumentMetadata, HttpStatus, NotFoundException, ValidationPipe } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { Response } from "express"
import { createResponse, MockResponse } from "node-mocks-http"
import { ChatMessagesController } from "src/chat-messages/chat-messages.controller"
import { CreateChatMessageDto } from "src/chat-messages/chat-messages.dto"
import { ChatMessagesService } from "src/modules/chat-messages/chat-messages.service"
import { FakeChatMessageCreate, generateChatMessage, generateFewChatMessages } from "./fakes-factory"

describe('ChatMessagesController', () => {
    let controller: ChatMessagesController
    let service: ChatMessagesService
    let response: MockResponse<Response>

    let target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true })
    const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: CreateChatMessageDto,
        data: ''
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatMessagesController],
            providers: [
                {
                    provide: ChatMessagesService,
                    useValue: {
                        createChatMessage: jest.fn((x) => x),
                        findChatMessagesByChannelId: jest.fn((x) => x),
                        updateChatMessage: jest.fn((x) => x),
                        deleteChatMessage: jest.fn((x) => x)
                    }
                }
            ]
        }).compile()

        controller = module.get<ChatMessagesController>(ChatMessagesController)
        service = module.get<ChatMessagesService>(ChatMessagesService)
        response = createResponse()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('createChatMessage', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'createChatMessage')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.createChatMessage(1, 1, FakeChatMessageCreate.chatMessageToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return chat message', async () => {
            const fakeChatMessage = FakeChatMessageCreate.createdChatMessage
            jest.spyOn(service, 'createChatMessage')
                .mockImplementation(async () => {
                    return fakeChatMessage
                })
            await controller.createChatMessage(1, 1, FakeChatMessageCreate.chatMessageToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.CREATED)
            expect(response._getJSONData()).toEqual(expect.objectContaining({
                id: fakeChatMessage.id,
                content: fakeChatMessage.content,
                postDate: fakeChatMessage.postDate.toISOString(),
                user: fakeChatMessage.user,
                chatChannel: fakeChatMessage.chatChannel
            }))
        })

        it('should return validation error', async () => {
            await target.transform(<CreateChatMessageDto>FakeChatMessageCreate.invalidChatMessageReq, metadata)
                .catch(err => {
                    expect(err.getResponse().statusCode).toBe(HttpStatus.BAD_REQUEST)
                    expect(err.getResponse().message).toEqual(['content should not be empty'])
                })
        })
    })

    describe('getChatMessagesFromChannel', () => {
        it('should return empty list', async () => {
            jest.spyOn(service, 'findChatMessagesByChannelId')
                .mockImplementation(async () => {
                    return []
                })
            await controller.getChatMessagesFromChannel(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject([])
        })

        it('should return not found', async () => {
            jest.spyOn(service, 'findChatMessagesByChannelId')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.getChatMessagesFromChannel(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return some chat messages', async () => {
            const fakeChatMessages = generateFewChatMessages()
            jest.spyOn(service, 'findChatMessagesByChannelId')
                .mockImplementation(async () => {
                    return fakeChatMessages
                })
            await controller.getChatMessagesFromChannel(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            let expected: any[] = fakeChatMessages
            expected.forEach(x => x.postDate = x.postDate.toISOString())
            expect(response._getJSONData()).toMatchObject(expected)
        })
    })

    describe('editChatMessage', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'updateChatMessage')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.editChatMessage(1, FakeChatMessageCreate.chatMessageToUpdate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return ok', async () => {
            jest.spyOn(service, 'updateChatMessage')
                .mockImplementation(async (id: number) => {
                    return {
                        statusCode: 200,
                        message: `Chat Message(id: ${id}) has been updated successfully`
                    }
                })
            await controller.editChatMessage(1, FakeChatMessageCreate.chatMessageToUpdate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData().statusCode).toBe(200)
            expect(response._getJSONData().message).toBe('Chat Message(id: 1) has been updated successfully')
        })
    })

    describe('deleteChatMessage', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'deleteChatMessage')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.deleteChatMessage(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return ok', async () => {
            jest.spyOn(service, 'deleteChatMessage')
                .mockImplementation(async (id: number) => {
                    return {
                        statusCode: 200,
                        message: `Chat Message(id: ${id}) has been deleted successfully`
                    }
                })
            await controller.deleteChatMessage(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData().statusCode).toBe(200)
            expect(response._getJSONData().message).toBe('Chat Message(id: 1) has been deleted successfully')
        })
    })
})