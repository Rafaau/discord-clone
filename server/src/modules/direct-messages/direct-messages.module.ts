import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DirectConversation } from "src/entities/direct-conversation";
import { DirectMessage } from "src/entities/direct-message";
import { User } from "src/entities/user";
import { DirectMessagesControler } from "./direct-messages.controller";
import { DirectMessagesService } from "./direct-messages.service";
import { DirectMessagesGateway } from "./gateway/direct-messages.gateway";

@Module({
    imports: [TypeOrmModule.forFeature([
        DirectMessage,
        User,
        DirectConversation,
    ])],
    controllers: [DirectMessagesControler],
    providers: [
        DirectMessagesService,
        DirectMessagesGateway
    ]
})
export class DirectMessagesModule {}