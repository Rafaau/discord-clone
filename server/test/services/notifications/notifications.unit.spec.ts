import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { NotificationsService } from "src/notifications/notifications.service"
import { Notification } from "src/typeorm/notification"
import { User } from "src/typeorm/user"
import { generateUser } from "test/controllers/users/fakes-factory"
import { Repository } from "typeorm"
import { FakeNotificationCreate } from "./fakes-factory"

describe('NotificationsService', () => {
    let service: NotificationsService
    let notificationRepository: Repository<Notification>
    let userRepository: Repository<User>

    const NOTIFICATION_REPO_TOKEN = getRepositoryToken(Notification)
    const USER_REPO_TOKEN = getRepositoryToken(User)

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                {
                    provide: NOTIFICATION_REPO_TOKEN,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOneBy: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: USER_REPO_TOKEN,
                    useValue: {
                        findOneBy: jest.fn(),
                        findOne: jest.fn()
                    }
                }
            ]
        }).compile()

        service = module.get<NotificationsService>(NotificationsService)
        notificationRepository = module.get<Repository<Notification>>(NOTIFICATION_REPO_TOKEN)
        userRepository = module.get<Repository<User>>(USER_REPO_TOKEN)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createNotification', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.createNotification(FakeNotificationCreate.notificationToCreate, 1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return created notification', async () => {
            const expected = FakeNotificationCreate.createdNotification
            jest.spyOn(userRepository, 'findOne')
                .mockResolvedValue(generateUser())
            jest.spyOn(notificationRepository, 'create')
                .mockImplementation(() => {
                    return expected
                })
            const result = await service.createNotification(FakeNotificationCreate.notificationToCreate, 1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('markAsRead', () => {
        it('should return not found exception', async () => {
            jest.spyOn(notificationRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.markAsRead(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return updated notification', async () => {
            const expected = FakeNotificationCreate.createdNotification
            jest.spyOn(notificationRepository, 'findOne')
                .mockResolvedValue(expected)
            const result = await service.markAsRead(1)
            expect(result).toMatchObject(expected)
        })
    })

    describe('getUnreadNotificationsForUser', () => {
        it('should return not found exception', async () => {
            jest.spyOn(userRepository, 'findOne')
                .mockResolvedValue(null)
            const result = () => service.getUnreadNotificationsForUser(1)
            await expect(result()).rejects.toThrowError(NotFoundException)
        })

        it('should return notifications', async () => {
            const expected = FakeNotificationCreate.createdNotification
            jest.spyOn(userRepository, 'findOne')
                .mockResolvedValue(generateUser())
            jest.spyOn(notificationRepository, 'find')
                .mockResolvedValue([expected])
            const result = await service.getUnreadNotificationsForUser(1)
            expect(result).toMatchObject([expected])
        })
    })
})