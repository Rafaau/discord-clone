import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import exp from "constants"
import { User } from "src/entities/user"
import { UsersService } from "src/users/users.service"
import { FakeUserCreate, generateUser } from "test/controllers/users/fakes-factory"
import { Repository } from "typeorm"

describe('UsersService', () => {
    let service: UsersService
    let userRepository: Repository<User>

    const USER_REPO_TOKEN = getRepositoryToken(User)

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: USER_REPO_TOKEN,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOneBy: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn()
                    }
                }
            ]
        }).compile()

        service = module.get<UsersService>(UsersService)
        userRepository = module.get<Repository<User>>(USER_REPO_TOKEN)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createUser', () => {
        it('should create a user', async () => {
            const expected = FakeUserCreate.createdUser
            jest.spyOn(userRepository, 'create')
                .mockImplementation(() => expected)
            jest.spyOn(userRepository, 'save')
                .mockImplementation(async () => expected)
            const result = await service.createUser(FakeUserCreate.userToCreate)
            expect(result).toMatchObject(expected)
        })
    })

    describe('findUserById', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOne')
                .mockImplementation(async () => null)
            const result = () => service.findUserById(1)
            await expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should find a user by id', async () => {
            const expected = generateUser()
            jest.spyOn(userRepository, 'findOne')
                .mockImplementation(async () => expected)
            const result = await service.findUserById(1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('updateUser', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockImplementation(async () => null)
            const result = () => service.updateUser(1, FakeUserCreate.userToUpdate)
            await expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return updated user', async () => {
            const expected = generateUser()
            jest.spyOn(userRepository, 'findOneBy')
                .mockImplementation(async () => expected)
            jest.spyOn(userRepository, 'save')
                .mockImplementation(async () => expected)
            const result = await service.updateUser(1, FakeUserCreate.userToUpdate)
            expect(result).toMatchObject(expected)
        })
    })

    describe('markUsersAsFriends', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOne')
                .mockImplementation(async () => null)
            const result = () => service.markUsersAsFriends(1, 2)
            await expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return OK', async () => {
            const expected = generateUser()
            jest.spyOn(userRepository, 'findOne')
                .mockResolvedValueOnce(generateUser())
            jest.spyOn(userRepository, 'findOne')
                .mockResolvedValueOnce(generateUser())
            const result = await service.markUsersAsFriends(1, 2)
            expect(result).toMatchObject({
                statusCode: 200,
                message: `User(id: ${1}) has been successfully marked as friend of User(id: ${2})`
            })
        })
    })

    describe('deleteUser', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockImplementation(async () => null)
            const result = () => service.deleteUser(1)
            await expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return OK', async () => {
            const expected = generateUser()
            jest.spyOn(userRepository, 'findOneBy')
                .mockImplementation(async () => expected)
            const result = await service.deleteUser(1)
            expect(result).toMatchObject({
                statusCode: 200,
                message: `User(id: ${1}) has been deleted successfully`
            })
        })
    })

    describe('findUserByEmail', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.findUserByEmail('test')
            await expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return user', async () => {
            const expected = generateUser()
            jest.spyOn(userRepository, 'findOne')
                .mockResolvedValue(expected)
            const result = await service.findUserByEmail('test')
            expect(result).toMatchObject(expected)
        })
    })

    describe('findFriendsOfUser', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOne')
                .mockImplementation(async () => null)
            const result = () => service.findFriendsOfUser(1)
            await expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return friends of user', async () => {
            const expected = generateUser()
            jest.spyOn(userRepository, 'findOne')
                .mockImplementation(async () => expected)
            const result = await service.findFriendsOfUser(1)
            expect(result).toMatchObject(expected.friends)
        })
    })

    describe('checkIfPasswordDoesMatch', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockImplementation(async () => null)
            const result = () => service.checkIfPasswordDoesMatch(1, 'test')
            await expect(result).rejects.toThrowError(NotFoundException)
        })

        it('should return true', async () => {
            const expected = generateUser()
            // BCRYPT HASH
            expected.password = '$2b$10$uxKeZfzFOJj9NU85dx4xYeE1VBKKc33J2R1GxIpQdlkPSED.sZvru'
            jest.spyOn(userRepository, 'findOneBy')
                .mockImplementation(async () => expected)
            const result = await service.checkIfPasswordDoesMatch(1, 'password')
            expect(result).toBe(true)
        })
    })
})