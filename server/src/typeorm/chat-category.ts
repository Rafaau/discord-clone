import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatChannel } from "./chat-channel";
import { ChatServer } from "./chat-server";

@Entity({ name: 'chat-categories' })
export class ChatCategory {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(() => ChatServer, (chatServer) => chatServer.chatCategories, {
        onDelete: 'CASCADE'
    })
    chatServer: ChatServer

    @OneToMany(() => ChatChannel, (chatChannel) => chatChannel.chatCategory, {
        onDelete: 'CASCADE',
        cascade: true
    })
    chatChannels: ChatChannel[]
}