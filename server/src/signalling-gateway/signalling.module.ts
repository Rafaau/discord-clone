import { Module } from "@nestjs/common";
import { SignallingGateway } from "./signalling.gateway";
import { ChatChannelsService } from "src/chat-channels/chat-channels.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatCategory } from "src/typeorm/chat-category";
import { ChatServer } from "src/typeorm/chat-server";

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