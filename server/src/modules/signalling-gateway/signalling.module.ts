import { Module } from "@nestjs/common";
import { SignallingGateway } from "./signalling.gateway";
import { ChatChannelsService } from "src/modules/chat-channels/chat-channels.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatChannel } from "src/entities/chat-channel";
import { ChatCategory } from "src/entities/chat-category";
import { ChatServer } from "src/entities/chat-server";

@Module({
    imports: [TypeOrmModule.forFeature([
        ChatChannel,
        ChatCategory,
        ChatServer
    ])],
    providers: [
        SignallingGateway,
        ChatChannelsService
    ]
})
export class SignallingModuleGateway {}