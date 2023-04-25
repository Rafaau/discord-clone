import { ArgumentMetadata, HttpStatus, NotFoundException, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Response } from 'express'
import { createResponse, MockResponse } from 'node-mocks-http'
import { CreateUserDto } from 'src/modules/users/users.dto'
import { User } from '../../../src/entities/user'
import { UsersController } from '../../../src/modules/users/users.controller'
import { UsersService } from '../../../src/modules/users/users.service'
import { FakeUserCreate, generateFewUsers, generateUser } from './fakes-factory'

describe('UsersController', () => {
    let controller: UsersController
    let service: UsersService
    let response: MockResponse<Response>

    let target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true })
    const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: CreateUserDto,
        data: ''
    }

    // const statusResponseMock = {
    //     send: jest.fn((x) => x)
    // } as unknown as Response

    // const responseMock = {
    //     status: jest.fn((x) => statusResponseMock),
    //     send: jest.fn((x) => x)
    // } as unknown as Response

    beforeEach(async() => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: {
                        findUsers: jest.fn((x) => x),
                        createUser: jest.fn((x) => x),
                        findUserById: jest.fn((x) => x),
                        findUsersByServer: jest.fn((x) => x),
                        findFriendsOfUser: jest.fn((x) => x),
                        updateUser: jest.fn((x) => x),
                        markUsersAsFriends: jest.fn((x) => x),
                        deleteUser: jest.fn((x) => x)
                    }
                }
            ],
        }).compile()

        controller = module.get<UsersController>(UsersController)
        service = module.get<UsersService>(UsersService)
        response = createResponse()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('postUser', () => {
        it('should return created status', async () => {
            jest.spyOn(service, 'createUser')
                .mockImplementation(async () => {
                    return FakeUserCreate.createdUser
                })
            await controller.createUser(FakeUserCreate.userToCreate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.CREATED)
            expect(response._getJSONData()).toMatchObject(FakeUserCreate.createdUser)
        })

        it('should return validation error', async () => {
            await target.transform(<CreateUserDto>FakeUserCreate.invalidUserReq, metadata)
                .catch(err => {
                    expect(err.getResponse().message).toEqual(['email must be an email'])
                    expect(err.getResponse().statusCode).toBe(HttpStatus.BAD_REQUEST)
                })
        })
    })

    describe('getUsers', () => {
        it('should return empty list', async () => {
            jest.spyOn(service, 'findUsers')
                .mockImplementation(async () => {
                    return []
                })
            await controller.getUsers(response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject([])
        })

        it('should return some Users', async () => {
            const fakeUsers = generateFewUsers()
            jest.spyOn(service, 'findUsers')
                .mockImplementation(async () => {
                    return fakeUsers
                })
            await controller.getUsers(response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject(fakeUsers)
        })
    })

    describe('getUserById', () => {
        it('should return user with requested id', async () => {
            const fakeUser = generateUser()
            jest.spyOn(service, 'findUserById')
                .mockImplementation(async () => {
                    return fakeUser
                })
            await controller.getUserById(fakeUser.id, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject(fakeUser)
        })

        it('should return not found', async () => {
            jest.spyOn(service, 'findUserById')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.getUserById(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            const result = response._getJSONData()
            expect(result.statusCode).toBe(404)
            expect(result.message).toBe("Not Found")
        })
    })

    describe('getUsersByChatServer', () => {
        it('should return some users', async () => {
            const fakeUsers = generateFewUsers()
            jest.spyOn(service, 'findUsersByServer')
                .mockImplementation(async () => {
                    return fakeUsers
                })
            await controller.getUsersByChatServer(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK);
            expect(response._getJSONData()).toMatchObject(fakeUsers)
            expect(response._getJSONData()[2]).toHaveProperty('isOwner', true)
        })

        it('should return empty list', async () => {
            jest.spyOn(service, 'findUsersByServer')
                .mockImplementation(async () => {
                    return []
                })
            await controller.getUsersByChatServer(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject([])
        })
    })

    describe('getFriendsOfUser', () => {
        it('should return some users', async () => {
            const fakerUsers = generateFewUsers()
            jest.spyOn(service, 'findFriendsOfUser')
                .mockImplementation(async () => {
                    return fakerUsers
                })
            await controller.getFriendsOfUser(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject(fakerUsers)
        })

        it('should return empty list', async () => {
            jest.spyOn(service, 'findFriendsOfUser')
                .mockImplementation(async () => {
                    return []
                })
            await controller.getFriendsOfUser(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject([])
        })

        it('should return not found', async () => {
            jest.spyOn(service, 'findFriendsOfUser')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.getFriendsOfUser(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })
    })

    describe('updateUser', () => {
        it('should return user', async () => {
            const fakeUser = generateUser()
            jest.spyOn(service, 'updateUser')
                .mockImplementation((): any => {
                    return fakeUser
                })
            await controller.updateUser(fakeUser.id, FakeUserCreate.userToUpdate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData()).toMatchObject(fakeUser)
        })

        it('should return not found', async () => {
            jest.spyOn(service, 'updateUser')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.updateUser(1, FakeUserCreate.userToUpdate, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })
    })

    describe('markUsersAsFriends', () => {
        it('should return ok', async () => {
            jest.spyOn(service, 'markUsersAsFriends')
                .mockImplementation((firstUserId: number, secondUserId: number): any => {
                    return {
                        statusCode: 200,
                        message: `User(id: ${firstUserId}) has been successfully marked as friend of User(id: ${secondUserId})`
                    }
                })
            await controller.markUsersAsFriends(1, 2, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData().statusCode).toBe(200)
            expect(response._getJSONData().message).toBe('User(id: 1) has been successfully marked as friend of User(id: 2)')
        })

        it('should return not found', async () => {
            jest.spyOn(service, 'markUsersAsFriends')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.markUsersAsFriends(1, 2, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe('Not Found')
        })
    })

    describe('deleteUser', () => {
        it('should return ok', async () => {
            jest.spyOn(service, 'deleteUser')
                .mockImplementation((id: number): any => {
                    return {
                        statusCode: 200,
                        message: `User(id: ${id}) has been deleted successfully`
                    }
                })
            await controller.deleteUser(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.OK)
            expect(response._getJSONData().statusCode).toBe(200)
            expect(response._getJSONData().message).toBe('User(id: 1) has been deleted successfully')
        })

        it('should return not found', async () => {
            jest.spyOn(service, 'deleteUser')
                .mockImplementation((): any => {
                    throw new NotFoundException()
                })
            await controller.deleteUser(1, response)
            expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND)
            expect(response._getJSONData().statusCode).toBe(404)
            expect(response._getJSONData().message).toBe("Not Found")
        })
    })
})