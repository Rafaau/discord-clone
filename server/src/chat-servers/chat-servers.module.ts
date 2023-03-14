import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatCategory } from "src/typeorm/chat-category";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatServer } from "src/typeorm/chat-server";
import { User } from "src/typeorm/user";
import { ChatServersController } from "./chat-servers.controller";
import { ChatServersService } from "./chat-servers.service";


@Module({
    imports: [TypeOrmModule.forFeature([
        ChatServer, 
        ChatCategory,
        ChatChannel,
        User, 
    ])],
    controllers: [ChatServersController],
    providers: [ChatServersService]
})
export class ChatServerModule {}