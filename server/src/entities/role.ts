import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatChannel } from "./chat-channel";
import { ChatServer } from "./chat-server";
import { Permission } from "./enums/Permission";
import { User } from "./user";

@Entity({ name: 'roles' })
export class Role {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ default: '' })
    description: string

    @Column({ 
        type: 'simple-json',
        nullable: true
    })
    permissions?: [{
        [key in Permission]: boolean
    }]

    @ManyToOne(() => ChatServer, chatServer => chatServer.roles, {
        onDelete: 'CASCADE'
    })
    chatServer?: ChatServer

    @ManyToMany(() => User, user => user.roles, {
        onDelete: 'CASCADE',
        nullable: true
    })
    @JoinTable()
    users?: User[]

    @ManyToMany(() => ChatChannel, chatChannel => chatChannel.roles, {
        nullable: true  
    })
    @JoinTable({ name: 'chat-channels-roles' })
    chatChannels?: ChatChannel[]
}