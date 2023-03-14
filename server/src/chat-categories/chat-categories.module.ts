import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatCategory } from "src/typeorm/chat-category";
import { ChatChannel } from "src/typeorm/chat-channel";
import { ChatServer } from "src/typeorm/chat-server";

@Module({
    imports: [TypeOrmModule.forFeature([
        ChatCategory, 
        ChatChannel, 
        ChatServer
    ])],
})
export class ChatCategoriesModule {}