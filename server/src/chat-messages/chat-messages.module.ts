import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatMessage } from "src/typeorm/chat-message";
import { MessageReaction } from "src/typeorm/message-reaction";
import { User } from "src/typeorm/user";
import { ChatMessagesController } from "./chat-messages.controller";
import { ChatMessagesService } from "./chat-messages.service";
import { ChatMessagesGateway } from "./gateway/chat-messages.gateway";

@Module({
    imports: [TypeOrmModule.forFeature([ChatMessage, ChatChannel, User, MessageReaction])],
    controllers: [ChatMessagesController],
    providers: [
        ChatMessagesService,
        ChatMessagesGateway
    ]
})
export class ChatMessagesModule {}