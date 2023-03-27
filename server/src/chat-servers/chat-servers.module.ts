import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatCategory } from "src/typeorm/chat-category";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatServer } from "src/typeorm/chat-server";
import { Permission } from "src/typeorm/permission";
import { Role } from "src/typeorm/role";
import { User } from "src/typeorm/user";
import { FileService } from "src/utils/file-service/file.service";
import { ChatServersController } from "./chat-servers.controller";
import { ChatServersService } from "./chat-servers.service";


@Module({
    imports: [TypeOrmModule.forFeature([
        ChatServer, 
        ChatCategory,
        ChatChannel,
        User, 
        Role,
        Permission
    ])],
    controllers: [ChatServersController],
    providers: [ChatServersService, FileService]
})
export class ChatServerModule {}