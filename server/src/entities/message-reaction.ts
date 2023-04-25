import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatMessage } from "./chat-message";
import { DirectMessage } from "./direct-message";
import { User } from "./user";

@Entity({ name: 'message-reactions' })
export class MessageReaction {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    reaction: string

    @ManyToOne(() => User, (user) => user.messageReactions, {
        onDelete: 'CASCADE'
    })
    user: User

    @ManyToOne(() => ChatMessage, (chatMessage) => chatMessage.reactions, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    chatMessage?: ChatMessage 

    @ManyToOne(() => DirectMessage, (directMessage) => directMessage.reactions, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    directMessage?: DirectMessage
}