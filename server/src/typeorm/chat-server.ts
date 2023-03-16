import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatCategory } from "./chat-category";
import { ChatServerInvitation } from "./chat-server-invitation";
import { User } from "./user";

@Entity({ name: 'chat-servers' })
export class ChatServer {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(() => User, (owner) => owner.managedChatServers)
    owner: User

    @ManyToMany(() => User, (member) => member.chatServers)
    @JoinTable()
    members: User[]

    @OneToMany(() => ChatCategory, (chatCategory) => chatCategory.chatServer, {
        nullable: true,
        onDelete: 'CASCADE',
        cascade: true
    })
    chatCategories?: ChatCategory[]

    @OneToMany(() => ChatServerInvitation, (chatServerInvitation) => chatServerInvitation.chatServer, {
        nullable: true
    })
    invitations?: ChatServerInvitation[]
}