import { HttpStatus, NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { Response } from "express"
import { createResponse, MockResponse } from "node-mocks-http"
import { ChatServerInvitationsController } from "src/chat-server-invitations/chat-server-invitations.controller"
import { ChatServerInvitationsService } from "src/modules/chat-server-invitations/chat-server-invitations.service"
import { generateChatServerInvitation } from "./fakes-factory"

describe('ChatServerInvitationsController', () => {
    let controller: ChatServerInvitationsController
    let service: ChatServerInvitationsService
    let response: MockResponse<Response>

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatServerInvitationsController],
            providers: [
                {
                    provide: ChatServerInvitationsService,
                    useValue: {
                        generateInvitation: jest.fn((x) => x),
                        findInvitationByUuid: jest.fn((x) => x),
                        findInvitationByChatServer: jest.fn((x) => x)
                    }
                }
            ]
        }).compile()

        controller = module.get<ChatServerInvitationsController>(ChatServerInvitationsController)
        service = module.get<ChatServerInvitationsService>(ChatServerInvitationsService)
        response = createResponse()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('createChatServerInvitation', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'generateInvitation')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.createChatServerInvitation(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return chat server invitation', async () => {
            const fakeInvitation = generateChatServerInvitation()
            jest.spyOn(service, 'generateInvitation')
                .mockImplementation(async () => {
                    return fakeInvitation
                })
            await controller.createChatServerInvitation(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.CREATED)
            let expected: any = fakeInvitation
            expected.expirationTime = expected.expirationTime.toISOString()
            expect(response._getJSONData()).toMatchObject(expected)
        })
    })

    describe('findInvitationByUuid', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'findInvitationByUuid')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.getChatServerInvitation('', response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return chat server invitation', async () => {
            const fakeInvitation = generateChatServerInvitation()
            jest.spyOn(service, 'findInvitationByUuid')
                .mockImplementation(async () => {
                    return fakeInvitation
                })
            await controller.getChatServerInvitation('', response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            let expected: any = fakeInvitation
            expected.expirationTime = expected.expirationTime.toISOString()
            expect(response._getJSONData()).toMatchObject(expected)
        })
    })

    describe('getInvitationByChatServer', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'findInvitationByChatServer')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.getInvitationByChatServer(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return chat server invitation', async () => {
            const fakeInvitation = generateChatServerInvitation()
            jest.spyOn(service, 'findInvitationByChatServer')
                .mockImplementation(async () => {
                    return fakeInvitation
                })
            await controller.getInvitationByChatServer(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            let expected: any = fakeInvitation
            expected.expirationTime = expected.expirationTime.toISOString()
            expect(response._getJSONData()).toMatchObject(expected)
        })
    })
})