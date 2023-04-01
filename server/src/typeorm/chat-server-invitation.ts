import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatServer } from "./chat-server";

@Entity({ name: 'chat-server-invitations' })
export class ChatServerInvitation {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @Column({ type: 'timestamp' })
    expirationTime: Date = new Date(((new Date()).setDate((new Date()).getDate() + 7)))

    @ManyToOne(() => ChatServer, (chatServer) => chatServer.invitations, {
        cascade: true,
    })
    chatServer: ChatServer
}