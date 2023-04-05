import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FriendRequest } from "src/typeorm/friend-request";
import { User } from "src/typeorm/user";
import { FriendRequestsService } from "./friend-requests.service";
import { FriendRequestsGateway } from "./gateway/friend-requests.gateway";
import { NotificationsService } from "src/notifications/notifications.service";
import { Notification } from "src/typeorm/notification";

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