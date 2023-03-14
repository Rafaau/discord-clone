import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DirectConversation } from "src/typeorm/direct-conversation";
import { DirectMessage } from "src/typeorm/direct-message";
import { User } from "src/typeorm/user";
import { DirectMessagesControler } from "./direct-messages.controller";
import { DirectMessagesService } from "./direct-messages.service";

@Module({
    imports: [TypeOrmModule.forFeature([
        DirectMessage,
        User,
        DirectConversation,
    ])],
    controllers: [DirectMessagesControler],
    providers: [DirectMessagesService]
})
export class DirectMessagesModule {}