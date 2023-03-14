import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatCategory } from "./chat-category";
import { ChatMessage } from "./chat-message";

@Entity({ name: 'chat-channels' })
export class ChatChannel {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(() => ChatCategory, (chatCategory) => chatCategory.chatChannels, {
        onDelete: 'CASCADE'
    })
    chatCategory: ChatCategory

    @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatChannel, {
        onDelete: 'CASCADE'
    })
    chatMessages: ChatMessage[]
}