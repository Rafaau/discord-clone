import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatServer } from "./chat-server";
import { Permission } from "./permission";
import { User } from "./user";

@Entity({ name: 'roles' })
export class Role {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ default: '' })
    description: string

    @ManyToMany(() => Permission, permission => permission.roles, {
        onDelete: 'CASCADE'
    })
    @JoinTable()
    permissions?: Role[]

    @ManyToOne(() => ChatServer, chatServer => chatServer.roles, {
        onDelete: 'CASCADE'
    })
    chatServer?: ChatServer

    @ManyToMany(() => User, user => user.roles, {
        nullable: true
    })
    @JoinTable()
    users?: User[]
}