import { Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DirectMessage } from "./direct-message";
import { User } from "./user";

@Entity({ name: 'direct-conversations' })
export class DirectConversation {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToMany(() => User, (user) => user.directConversations, {
        onDelete: 'CASCADE'
    })
    users: User[]

    @OneToMany(() => DirectMessage, (directMessage) => directMessage.directConversation, {
        nullable: true,
        onDelete: 'CASCADE'
    })
    directMessages: DirectMessage[]
}