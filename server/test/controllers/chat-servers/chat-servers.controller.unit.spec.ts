import { ArgumentMetadata, HttpStatus, NotFoundException } from "@nestjs/common"
import { ValidationPipe } from "@nestjs/common/pipes"
import { Test, TestingModule } from "@nestjs/testing"
import { Response } from "express"
import { createResponse, MockResponse } from "node-mocks-http"
import { ChatServersController } from "src/chat-servers/chat-servers.controller"
import { CreateChatServerDto } from "src/chat-servers/chat-servers.dto"
import { ChatServersService } from "src/modules/chat-servers/chat-servers.service"
import { FakeChatServerCreate, generateChatServer, generateFewChatServers } from "./fakes-factory"

describe('ChatServersController', () => {
    let controller: ChatServersController
    let service: ChatServersService
    let response: MockResponse<Response>

    let target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true})
    const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: CreateChatServerDto,
        data: ''
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatServersController],
            providers: [
                {
                    provide: ChatServersService,
                    useValue: {
                        createChatServer: jest.fn((x) => x),
                        getAllChatServers: jest.fn((x) => x),
                        getChatServerById: jest.fn((x) => x),
                        getChatServersByUserId: jest.fn((x) => x),
                        addMemberToChatServer: jest.fn((x) => x),
                        deleteChatServer: jest.fn((x) => x),
                        removeMemberFromChatServer: jest.fn((x) => x)
                    }
                }
            ]
        }).compile()

        controller = module.get<ChatServersController>(ChatServersController)
        service = module.get<ChatServersService>(ChatServersService)
        response = createResponse()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('createChatServer', () => {
        it('should return 201 and object', async () => {
            const createdChatServer = FakeChatServerCreate.createdChatServer
            jest.spyOn(service, 'createChatServer')
                .mockImplementation((): any => {
                    return createdChatServer
                })
            await controller.createChatServer(1, FakeChatServerCreate.chatServerToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.CREATED)
            expect(response._getJSONData()).toMatchObject(createdChatServer)
        })

        it('should return not found', async () => {
            jest.spyOn(service, 'createChatServer')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.createChatServer(1, FakeChatServerCreate.chatServerToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return validation error', async () => {
            await target.transform(<CreateChatServerDto>FakeChatServerCreate.invalidChatServerReq, metadata)
                .catch(err => {
                    expect(err.getResponse().statusCode).toBe(HttpStatus.BAD_REQUEST)
                    expect(err.getResponse().message).toEqual(['name should not be empty'])
                })
        })
    })

    describe('getChatServers', () => {
        it('should return empty list', async () => {
            jest.spyOn(service, 'getAllChatServers')
                .mockImplementation(async () => {
                    return []
                })
            await controller.getChatServers(response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject([])
        })

        it('should return some chat servers', async () => {
            const fakeChatServers = generateFewChatServers()
            jest.spyOn(service, 'getAllChatServers')
                .mockImplementation(async () => {
                    return fakeChatServers
                })
            await controller.getChatServers(response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject(fakeChatServers)
        })
    })

    describe('getChatServer', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'getChatServerById')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.getChatServer(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return chat server', async () => {
            const fakeChatServer = generateChatServer()
            jest.spyOn(service, 'getChatServerById')
                .mockImplementation(async () => {
                    return fakeChatServer
                })
            await controller.getChatServer(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject(fakeChatServer)
        })
    })

    describe('getUserChatServers', () => {
        it('should return chat servers', async () => {
            const fakeChatServer = generateFewChatServers()
            jest.spyOn(service, 'getChatServersByUserId')
                .mockImplementation(async () => {
                    return fakeChatServer
                })
            await controller.getUserChatServers(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject(fakeChatServer)
        })

        it('should return empty list', async () => {
            jest.spyOn(service, 'getChatServersByUserId')
                .mockImplementation(async () => {
                    return []
                })
            await controller.getUserChatServers(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject([])
        })
    })

    describe('addUserToChatChannel', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'addMemberToChatServer')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.addUserToChatServer(1, 2, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return chat server', async () => {
            const fakeChatServer = generateChatServer()
            jest.spyOn(service, 'addMemberToChatServer')
                .mockImplementation(async () => {
                    return fakeChatServer
                })
            await controller.addUserToChatServer(1, 2, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject(fakeChatServer)
        })
    })

    describe('removeMemberFromChatServer', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'removeMemberFromChatServer')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.removeMemberFromChatServer(1, 1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return ok', async () => {
            jest.spyOn(service, 'removeMemberFromChatServer')
                .mockImplementation(async (userId: number, chatServerId: number) => {
                    return {
                        statusCode: 200,
                        message: `User (id: ${userId}) has been successfully removed from Chat Server (id: ${chatServerId})`
                    }
                })
            await controller.removeMemberFromChatServer(1, 1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData().statusCode).toBe(200)
            expect(response._getJSONData().message).toBe('User (id: 1) has been successfully removed from Chat Server (id: 1)')
        })
    })

    describe('deleteChatServer', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'deleteChatServer')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.deleteChatServer(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return ok', async () => {
            jest.spyOn(service, 'deleteChatServer')
                .mockImplementation(async (id: number) => {
                    return {
                        statusCode: 200,
                        message: `Chat Server(id: ${id}) has been deleted successfully`
                    }
                })
            await controller.deleteChatServer(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData().statusCode).toBe(200)
            expect(response._getJSONData().message).toBe('Chat Server(id: 1) has been deleted successfully')
        })
    })
})