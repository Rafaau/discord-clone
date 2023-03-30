import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { RolesService } from "src/roles/roles.service"
import { ChatServer } from "src/typeorm/chat-server"
import { Role } from "src/typeorm/role"
import { User } from "src/typeorm/user"
import { generateChatServer } from "test/controllers/chat-servers/fakes-factory"
import { generateUser } from "test/controllers/users/fakes-factory"
import { Repository } from "typeorm"
import { FakeRoleCreate } from "./fakes-factory"

describe('RolesService', () => {
    let service: RolesService
    let roleRepository: Repository<Role>
    let userRepository: Repository<User>
    let chatServerRepository: Repository<ChatServer>

    const ROLE_REPO_TOKEN = getRepositoryToken(Role)
    const USER_REPO_TOKEN = getRepositoryToken(User)
    const SERVER_REPO_TOKEN = getRepositoryToken(ChatServer)
    
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesService,
                {
                    provide: ROLE_REPO_TOKEN,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOneBy: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        remove: jest.fn()
                    }
                },
                {
                    provide: USER_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn()
                    }
                },
                {
                    provide: SERVER_REPO_TOKEN,
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn()
                    }
                }
            ]
        }).compile()

        service = module.get<RolesService>(RolesService)
        roleRepository = module.get<Repository<Role>>(ROLE_REPO_TOKEN)
        userRepository = module.get<Repository<User>>(USER_REPO_TOKEN)
        chatServerRepository = module.get<Repository<ChatServer>>(SERVER_REPO_TOKEN)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createRole', () => {
        it('should return not found exception', async () => {
            jest.spyOn(chatServerRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.createRole(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return role', async () => {
            const expected = FakeRoleCreate.createdRole
            jest.spyOn(chatServerRepository, 'findOne')
                .mockResolvedValue(generateChatServer())
            jest.spyOn(roleRepository, 'create')
                .mockImplementation(() => {
                    return expected
                })
            const result = await service.createRole(1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('assignMembersToRole', () => {
        it('should return not found exception', async () => {
            jest.spyOn(roleRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.assignMembersToRole(1, [1])
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return role', async () => {
            jest.spyOn(roleRepository, 'findOne')
                .mockResolvedValue(FakeRoleCreate.createdRole)
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(generateUser())
            const result = await service.assignMembersToRole(1, [1])
            expect(result).toMatchObject(FakeRoleCreate.createdRole)
        })
    })

    describe('removeMemberFromRole', () => {
        it('should return not found exception', async () => {
            jest.spyOn(roleRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.removeMemberFromRole(1, 1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return role', async () => {
            const expected = FakeRoleCreate.createdRole
            jest.spyOn(roleRepository, 'findOne')
                .mockResolvedValue(expected)
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValue(generateUser())
            const result = await service.removeMemberFromRole(1, 1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('updateRole', () => {
        it('should return not found exception', async () => {
            jest.spyOn(roleRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.updateRole(1, FakeRoleCreate.updateRoleParams)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return role', async () => {
            const expected = FakeRoleCreate.createdRole
            jest.spyOn(roleRepository, 'findOne')
                .mockResolvedValue(expected)
            jest.spyOn(roleRepository, 'save')
                .mockResolvedValue(expected)
            const result = await service.updateRole(1, FakeRoleCreate.updateRoleParams)
            expect(result).toMatchObject(expected)
        })
    })

    describe('deleteRole', () => {
        it('should return not found exception', async () => {
            jest.spyOn(roleRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.deleteRole(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return role', async () => {
            const expected = FakeRoleCreate.createdRole
            jest.spyOn(roleRepository, 'findOneBy')
                .mockResolvedValue(expected)
            const result = await service.deleteRole(1)
            expect(result).toMatchObject(expected)
        })
    })
})