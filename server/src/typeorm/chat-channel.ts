import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatCategory } from "./chat-category";
import { ChatMessage } from "./chat-message";
import { Role } from "./role";
import { User } from "./user";
import { ChannelType } from "./enums/ChannelType";

@Entity({ name: 'chat-channels' })
export class ChatChannel {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    index: number

    @Column({ default: ChannelType.Text })
    type: ChannelType

    @Column()
    isPrivate: boolean

    @ManyToOne(() => ChatCategory, (chatCategory) => chatCategory.chatChannels, {
        onDelete: 'CASCADE'
    })
    chatCategory: ChatCategory

    @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatChannel, {
        onDelete: 'CASCADE',
        cascade: true
    })
    chatMessages: ChatMessage[]

    @ManyToMany(() => User, user => user.chatChannels, {
        onDelete: 'CASCADE',
        nullable: true
    })
    users: User[]

    @ManyToMany(() => Role, role => role.chatChannels, {
        nullable: true
    })
    roles?: Role[]

    @OneToMany(() => User, user => user.currentVoiceChannel, {
        onDelete: 'CASCADE',
        nullable: true
    })
    voiceUsers: User[]
}