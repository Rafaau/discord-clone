import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatServer } from "src/entities/chat-server";
import { Role } from "src/entities/role";
import { User } from "src/entities/user";
import { RolesGateway } from "./gateway/roles.gateway";
import { RolesService } from "./roles.service";

@Module({
    imports: [TypeOrmModule.forFeature([
        Role,
        User,
        ChatServer
    ])],
    providers: [
        RolesService,
        RolesGateway
    ],
})
export class RolesModule {}