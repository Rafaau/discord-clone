import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatChannel } from "./chat-channel";
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

    @ManyToOne(() => ChatChannel, (chatChannel) => chatChannel.chatMessages)
    chatChannel: ChatChannel
}