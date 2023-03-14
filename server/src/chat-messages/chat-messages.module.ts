import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatMessage } from "src/typeorm/chat-message";
import { User } from "src/typeorm/user";
import { ChatMessagesController } from "./chat-messages.controller";
import { ChatMessagesService } from "./chat-messages.service";

@Module({
    imports: [TypeOrmModule.forFeature([ChatMessage, ChatChannel, User])],
    controllers: [ChatMessagesController],
    providers: [ChatMessagesService]
})
export class ChatMessagesModule {}