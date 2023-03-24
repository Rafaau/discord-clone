import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatMessage } from "./chat-message";
import { ChatServer } from "./chat-server";
import { DirectConversation } from "./direct-conversation";
import { DirectMessage } from "./direct-message";
import { MessageReaction } from "./message-reaction";
import { Notification } from "./notification";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column() 
    email: string

    @Column()
    password: string

    @Column({ nullable: true })
    phoneNumber?: string

    @OneToMany(() => ChatServer, (chatServer) => chatServer.owner, {
        nullable: true
    })
    managedChatServers?: ChatServer[]

    @ManyToMany(() => ChatServer, (chatServer) => chatServer.members, {
        nullable: true
    })
    chatServers?: ChatServer[]

    @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.user, {
        nullable: true
    })
    chatMessages?: ChatMessage[]

    @ManyToMany(() => User, (user) => user.friends, {
        nullable: true
    })
    @JoinTable()
    friends?: User[]

    @ManyToMany(() => DirectConversation, (directConversation) => directConversation.users, {
        nullable: true,
        cascade: true,
        onDelete: 'CASCADE'
    })
    @JoinTable()
    directConversations?: DirectConversation[]

    @OneToMany(() => DirectMessage, (directMessage) => directMessage.user, {
        nullable: true
    })
    directMessages?: DirectMessage[]

    @ManyToMany(() => MessageReaction, (messageReaction) => messageReaction.user, {
        onDelete: 'CASCADE'
    })
    @JoinTable({ name: 'users-message-reactions' })
    messageReactions: MessageReaction[]

    @OneToMany(() => Notification, notification => notification.recipient, {
        nullable: true
    })
    notifications?: Notification[]
}