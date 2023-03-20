import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatCategory } from "src/typeorm/chat-category";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatServer } from "src/typeorm/chat-server";
import { ChatChannelsController } from "./chat-channels.controller";
import { ChatChannelsService } from "./chat-channels.service";
import { ChatChannelsGateway } from "./gateway/chat-channels.gateway";

@Module({
    imports: [TypeOrmModule.forFeature([
        ChatChannel, 
        ChatCategory, 
        ChatServer
    ])],
    controllers: [ChatChannelsController],
    providers: [
        ChatChannelsService,
        ChatChannelsGateway
    ]
})
export class ChatChannelsModule {}