import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DirectConversation } from "./direct-conversation";
import { MessageReaction } from "./message-reaction";
import { User } from "./user";

@Entity({ name: 'direct-messages' })
export class DirectMessage {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    content: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    postDate: Date

    @ManyToOne(() => User, (user) => user.directMessages)
    user: User

    @ManyToOne(() => DirectConversation, (directConversation) => directConversation.directMessages, {
        onDelete: 'CASCADE'
    })
    directConversation: DirectConversation

    @OneToMany(() => MessageReaction, (messageReaction) => messageReaction.directMessage, {
        onDelete: 'CASCADE',
        nullable: true
    })
    reactions?: MessageReaction[]
}