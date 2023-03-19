import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PolymorphicParent } from "typeorm-polymorphic";
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
        nullable: true,
        onDelete: 'CASCADE'
    })
    chatMessage?: ChatMessage 

    @ManyToOne(() => DirectMessage, (directMessage) => directMessage.reactions, {
        nullable: true,
        onDelete: 'CASCADE'
    })
    directMessage?: ChatMessage
}