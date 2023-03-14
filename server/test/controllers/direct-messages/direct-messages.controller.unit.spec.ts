import { ArgumentMetadata, HttpStatus, NotFoundException, ValidationPipe } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { Response } from "express"
import { createResponse, MockResponse } from "node-mocks-http"
import { DirectMessagesControler } from "src/direct-messages/direct-messages.controller"
import { CreateDirectMessageDto, UpdateDirectMessageDto } from "src/direct-messages/direct-messages.dto"
import { DirectMessagesService } from "src/direct-messages/direct-messages.service"
import { FakeDirectMessageCreate, generateDirectMessage, generateFewDirectMessages } from "./fakes-factory"

describe('DirectMessagesController', () => {
    let controller: DirectMessagesControler
    let service: DirectMessagesService
    let response: MockResponse<Response>

    let target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true})
    const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: CreateDirectMessageDto,
        data: ''
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DirectMessagesControler],
            providers: [
                {
                    provide: DirectMessagesService,
                    useValue: {
                        createDirectMessage: jest.fn((x) => x),
                        findDirectMessagesByConversation: jest.fn((x) => x),
                        updateDirectMessage: jest.fn((x) => x),
                        deleteDirectMessage: jest.fn((x) => x)
                    }
                }
            ]
        }).compile()

        controller = module.get<DirectMessagesControler>(DirectMessagesControler)
        service = module.get<DirectMessagesService>(DirectMessagesService)
        response = createResponse()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('createDirectMessage', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'createDirectMessage')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.createDirectMessage(1, 1, FakeDirectMessageCreate.directMessageToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return direct message', async () => {
            const fakeDirectMessage = FakeDirectMessageCreate.createdDirectMessage
            jest.spyOn(service, 'createDirectMessage')
                .mockImplementation(async () => {
                    return fakeDirectMessage
                })
            await controller.createDirectMessage(1, 1, FakeDirectMessageCreate.directMessageToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.CREATED)
            const expected: any = fakeDirectMessage
            expected.postDate = expected.postDate.toISOString()
            expect(response._getJSONData()).toMatchObject(expected)
        })

        it('should return validation error', async () => {
            await target.transform(<CreateDirectMessageDto>FakeDirectMessageCreate.invalidCreateReq, metadata)
                .catch(err => {
                    expect(err.getResponse().statusCode).toBe(HttpStatus.BAD_REQUEST)
                    expect(err.getResponse().message).toEqual(['content should not be empty'])
                })
        })
    })

    describe('getDirectMessagesByConversation', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'findDirectMessagesByConversation')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.getDirectMessagesByConversation(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return some direct messages', async () => {
            const fakeDirectMessages = generateFewDirectMessages()
            jest.spyOn(service, 'findDirectMessagesByConversation')
                .mockImplementation(async () => {
                    return fakeDirectMessages
                })
            await controller.getDirectMessagesByConversation(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            const expected: any = fakeDirectMessages
            expected.forEach(x => x.postDate = x.postDate.toISOString())
            expect(response._getJSONData()).toMatchObject(expected)
        })

        it('should return empty list', async () => {
            jest.spyOn(service, 'findDirectMessagesByConversation')
                .mockImplementation(async () => {
                    return []
                })
            await controller.getDirectMessagesByConversation(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject([])
        })
    })

    describe('updateDirectMessage', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'updateDirectMessage')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.updateDirectMessage(1, FakeDirectMessageCreate.directMessageToUpdate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return ok', async () => {
            jest.spyOn(service, 'updateDirectMessage')
                .mockImplementation(async (id: number) => {
                    return {
                        statusCode: 200,
                        message: `Direct Message(id: ${id}) has been updated successfully`
                    }
                })
            await controller.updateDirectMessage(1, FakeDirectMessageCreate.directMessageToUpdate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData().statusCode).toBe(200)
            expect(response._getJSONData().message).toBe('Direct Message(id: 1) has been updated successfully')
        })

        it('should return validation error', async () => {
            const metadata: ArgumentMetadata = {
                type: 'body', 
                metatype: UpdateDirectMessageDto,
                data: ''
            }
            await target.transform(<UpdateDirectMessageDto>FakeDirectMessageCreate.invalidUpdateReq, metadata)
                .catch(err => {
                    expect(err.getResponse().statusCode).toBe(HttpStatus.BAD_REQUEST)
                    expect(err.getResponse().message).toEqual(['content should not be empty'])
                })

        })
    })

    describe('deleteDirectMessage', () => {
        it('should return not found', async () => {
            jest.spyOn(service, 'deleteDirectMessage')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.deleteDirectMessage(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })

        it('should return ok', async () => {
            jest.spyOn(service, 'deleteDirectMessage')
                .mockImplementation(async (id: number) => {
                    return {
                        statusCode: 200,
                        message: `Direct Message(id: ${id}) has been deleted successfully`
                    }
                })
            await controller.deleteDirectMessage(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData().statusCode).toBe(200)
            expect(response._getJSONData().message).toBe('Direct Message(id: 1) has been deleted successfully')
        })
    })
})