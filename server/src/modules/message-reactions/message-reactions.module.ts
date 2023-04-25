import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatMessage } from "src/entities/chat-message";
import { DirectMessage } from "src/entities/direct-message";
import { MessageReaction } from "src/entities/message-reaction";
import { User } from "src/entities/user";
import { MessagesReactionsGateway } from "./gateway/message-reactions.gateway";
import { MessageReactionsService } from "./message-reactions.service";

@Module({
    imports: [TypeOrmModule.forFeature([
        MessageReaction,
        ChatMessage,
        DirectMessage,
        User
    ])],
    providers: [
        MessageReactionsService,
        MessagesReactionsGateway
    ]
})
export class MessageReactionsModule {}