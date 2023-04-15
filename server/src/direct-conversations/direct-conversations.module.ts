import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DirectConversation } from "src/typeorm/direct-conversation";
import { User } from "src/typeorm/user";
import { DirectConversationsController } from "./direct-conversations.controller";
import { DirectConversationsService } from "./direct-conversations.service";
import { DirectConversationsGateway } from "./gateway/direct-conversations.gateway";

@Module({
    imports: [TypeOrmModule.forFeature([
        DirectConversation,
        User
    ])],
    controllers: [DirectConversationsController],
    providers: [
        DirectConversationsService,
        DirectConversationsGateway
    ]
})
export class DirectConversationModule {}