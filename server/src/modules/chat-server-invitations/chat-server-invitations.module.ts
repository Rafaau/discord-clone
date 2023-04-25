import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatServer } from "src/entities/chat-server";
import { ChatServerInvitation } from "src/entities/chat-server-invitation";
import { ChatServerInvitationsController } from "./chat-server-invitations.controller";
import { ChatServerInvitationsService } from "./chat-server-invitations.service";

@Module({
    imports: [TypeOrmModule.forFeature([
        ChatServerInvitation,
        ChatServer
    ])],
    controllers: [ChatServerInvitationsController],
    providers: [ChatServerInvitationsService]
})
export class ChatServerInvitationsModule {}