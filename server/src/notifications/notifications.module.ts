import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "src/typeorm/notification";
import { User } from "src/typeorm/user";
import { NotificationsGateway } from "./gateway/notifications.gateway";
import { NotificationsController } from "./notifications.controllet";
import { NotificationsService } from "./notifications.service";

@Module({
    imports: [TypeOrmModule.forFeature([
        Notification,
        User
    ])],
    controllers: [NotificationsController],
    providers: [
        NotificationsService,
        NotificationsGateway
    ]
})
export class NotificationsModule {}