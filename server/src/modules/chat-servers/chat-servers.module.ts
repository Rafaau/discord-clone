import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatCategory } from "src/entities/chat-category";
import { ChatChannel } from "src/entities/chat-channel";
import { ChatServer } from "src/entities/chat-server";
import { Role } from "src/entities/role";
import { User } from "src/entities/user";
import { FileService } from "src/utils/file-service/file.service";
import { ChatServersController } from "./chat-servers.controller";
import { ChatServersService } from "./chat-servers.service";
import { ChatServersGateway } from "./gateway/chat-servers.gateway";


@Module({
    imports: [TypeOrmModule.forFeature([
        ChatServer, 
        ChatCategory,
        ChatChannel,
        User, 
        Role,
    ])],
    controllers: [ChatServersController],
    providers: [
        ChatServersService, 
        FileService,
        ChatServersGateway
    ]
})
export class ChatServerModule {}