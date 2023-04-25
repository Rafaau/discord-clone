import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FriendRequest } from "src/entities/friend-request";
import { User } from "src/entities/user";
import { FriendRequestsService } from "./friend-requests.service";
import { NotificationsService } from "src/modules/notifications/notifications.service";
import { Notification } from "src/entities/notification";
import { FriendRequestsGateway } from "./gateway/friend-requests.gateway";

@Module({
    imports: [TypeOrmModule.forFeature([
        FriendRequest,
        User,
        Notification
    ])],
    providers: [
        FriendRequestsService,
        FriendRequestsGateway,
        NotificationsService
    ],
})
export class FriendRequestsModule {}