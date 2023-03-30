import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatCategory } from "./chat-category";
import { ChatMessage } from "./chat-message";
import { Role } from "./role";
import { User } from "./user";

@Entity({ name: 'chat-channels' })
export class ChatChannel {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    index: number

    @Column()
    isPrivate: boolean

    @ManyToOne(() => ChatCategory, (chatCategory) => chatCategory.chatChannels, {
        onDelete: 'CASCADE'
    })
    chatCategory: ChatCategory

    @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatChannel, {
        onDelete: 'CASCADE'
    })
    chatMessages: ChatMessage[]

    @ManyToMany(() => User, user => user.chatChannels, {
        nullable: true
    })
    users: User[]

    @ManyToMany(() => Role, role => role.chatChannels, {
        nullable: true
    })
    roles?: Role[]
}