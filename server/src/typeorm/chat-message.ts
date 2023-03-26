import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatChannel } from "./chat-channel";
import { MessageReaction } from "./message-reaction";
import { User } from "./user";

@Entity({ name: 'chat-messages' })
export class ChatMessage {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    content: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    postDate: Date

    @ManyToOne(() => User, (user) => user.chatMessages)
    user: User

    @ManyToOne(() => ChatChannel, (chatChannel) => chatChannel.chatMessages, {
        onDelete: 'CASCADE'
    })
    chatChannel: ChatChannel

    @OneToMany(() => MessageReaction, (messageReaction) => messageReaction.chatMessage, {
        nullable: true
    })
    reactions?: MessageReaction[]
}