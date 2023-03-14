import { HttpStatus, NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { Response } from "express"
import { createResponse, MockResponse } from "node-mocks-http"
import { DirectConversationsController } from "src/direct-conversations/direct-conversations.controller"
import { DirectConversationsService } from "src/direct-conversations/direct-conversations.service"
import { FakeDirectConversationCreate, generateDirectConversation, generateFewDirectConversations } from "./fakes-factory"

describe('DirectConversationController', () => {
    let controller: DirectConversationsController
    let service: DirectConversationsService
    let response: MockResponse<Response>

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DirectConversationsController],
            providers: [
                {
                    provide: DirectConversationsService,
                    useValue: {
                        createDirectConversation: jest.fn((x) => x),
                        findConversationsOfUser: jest.fn((x) => x),
                        findConversationById: jest.fn((x) => x),
                        deleteDirectConversation: jest.fn((x) => x)
                    }
                }
            ]
        }).compile()

        controller = module.get<DirectConversationsController>(DirectConversationsController)
        service = module.get<DirectConversationsService>(DirectConversationsService)
        response = createResponse()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('createDirectConversation', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'createDirectConversation')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.createDirectConversation(FakeDirectConversationCreate.directConversationToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return direct conversation', async () => {
            const createdDirectConversation = FakeDirectConversationCreate.createdDirectConversation
            jest.spyOn(service, 'createDirectConversation')
                .mockImplementation(async () => {
                    return createdDirectConversation
                })
            await controller.createDirectConversation(FakeDirectConversationCreate.directConversationToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.CREATED)
            expect(response._getJSONData()).toMatchObject(createdDirectConversation)
        })
    })

    describe('getConversationsOfUser', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'findConversationsOfUser')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.getConversationsOfUser(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe("Not Found")
        })

        it('should return direct conversations', async () => {
            const fakeDirectConversations = generateFewDirectConversations()
            jest.spyOn(service, 'findConversationsOfUser')
                .mockImplementation(async () => {
                    return fakeDirectConversations
                })
            await controller.getConversationsOfUser(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject(fakeDirectConversations)
        })

        it('should return empty list', async () => {
            jest.spyOn(service, 'findConversationsOfUser')
                .mockImplementation(async () => {
                    return []
                })
            await controller.getConversationsOfUser(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject([])        
        })
    })

    describe('getConversation', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'findConversationById')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.getConversation(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return direct conversation', async () => {
            const fakeDirectConversation = generateDirectConversation()
            jest.spyOn(service, 'findConversationById')
                .mockImplementation(async () => {
                    return fakeDirectConversation
                })
            await controller.getConversation(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject(fakeDirectConversation)     
        })
    })

    describe('deleteDirectConversation', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'deleteDirectConversation')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.deleteDirectConversation(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return ok', async () => {
            jest.spyOn(service, 'deleteDirectConversation')
                .mockImplementation(async (id: number) => {
                    return {
                        statusCode: 200,
                        message: `Direct Conversation(id: ${id}) has been deleted successfully`
                    }
                })
            await controller.deleteDirectConversation(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData().statusCode).toBe(200)
            expect(response._getJSONData().message).toBe('Direct Conversation(id: 1) has been deleted successfully')           
        })
    })
})