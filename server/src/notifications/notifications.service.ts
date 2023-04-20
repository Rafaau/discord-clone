import { NotFoundException } from "@nestjs/common";
import { Injectable } from "@nestjs/common/decorators";
import { InjectRepository } from "@nestjs/typeorm";
import { Notification } from "src/typeorm/notification";
import { User } from "src/typeorm/user";
import { CreateNotificationParams } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}

    async createNotification(
        notificationDetails: CreateNotificationParams,
        userId: number
    ) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['appSettings']
        }) 
        if (!user)
            throw new NotFoundException()
        if (!user.appSettings.messageBadge)
            return
        const newNotification = this.notificationRepository.create({
            ...notificationDetails,
            recipient: user
        })
        await this.notificationRepository.save(newNotification)
        return newNotification
    }

    async markAsRead(id: number) {
        const notification = await this.notificationRepository.findOne({
            where: { id },
            relations: ['recipient']
        })
        if (!notification)
            throw new NotFoundException()
        notification.read = true
        await this.notificationRepository.save(notification)
        return notification
    }

    async getUnreadNotificationsForUser(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        })
        if (!user)
            throw new NotFoundException()
        return await this.notificationRepository.find({
            where: {
                recipient: user,
                read: false
            }
        })
    }
}