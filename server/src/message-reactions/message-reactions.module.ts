import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatMessage } from "src/typeorm/chat-message";
import { DirectMessage } from "src/typeorm/direct-message";
import { MessageReaction } from "src/typeorm/message-reaction";
import { User } from "src/typeorm/user";
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