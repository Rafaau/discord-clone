import { faker } from "@faker-js/faker"
import { CreateNotificationDto } from "src/notifications/notifications.dto"
import { Notification } from "src/typeorm/notification"
import { generateUser } from "test/controllers/users/fakes-factory"

export class FakeNotificationCreate {
    static createdNotification: Notification = {
        id: faker.datatype.number(),
        message: faker.lorem.sentence(),
        source: faker.lorem.sentence(),
        recipient: generateUser(),
        read: false
    }

    static notificationToCreate: CreateNotificationDto = {
        message: faker.lorem.sentence(),
        source: faker.lorem.sentence(),
    }
}