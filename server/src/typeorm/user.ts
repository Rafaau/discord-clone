import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatChannel } from "./chat-channel";
import { ChatMessage } from "./chat-message";
import { ChatServer } from "./chat-server";
import { DirectConversation } from "./direct-conversation";
import { DirectMessage } from "./direct-message";
import { MessageReaction } from "./message-reaction";
import { Notification } from "./notification";
import { Role } from "./role";
import { FriendRequest } from "./friend-request";

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
        onDelete: 'CASCADE',
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

    @OneToMany(() => MessageReaction, (messageReaction) => messageReaction.user, {
        onDelete: 'CASCADE',
        nullable: true
    })
    messageReactions?: MessageReaction[]

    @OneToMany(() => Notification, notification => notification.recipient, {
        onDelete: 'CASCADE',
        nullable: true
    })
    notifications?: Notification[]

    @ManyToMany(() => Role, role => role.users, {
        onDelete: 'CASCADE',
        nullable: true
    })
    roles?: Role[]

    @ManyToMany(() => ChatChannel, chatChannel => chatChannel.users, {
        nullable: true
    })
    @JoinTable({ name: 'users-chat-channels' })
    chatChannels?: ChatChannel[]

    @OneToMany(() => FriendRequest, friendRequest => friendRequest.sender, {
        onDelete: 'CASCADE',
        nullable: true
    })
    friendRequestsSent?: FriendRequest[]

    @OneToMany(() => FriendRequest, friendRequest => friendRequest.receiver, {
        onDelete: 'CASCADE',
        nullable: true
    })
    friendRequestsReceived?: FriendRequest[]
}