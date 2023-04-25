import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity({ name: 'friend-requests' })
export class FriendRequest {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'enum', enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' })
    status: string

    @ManyToOne(() => User, (user) => user.friendRequestsSent, {
        onDelete: 'CASCADE'
    })
    sender: User

    @ManyToOne(() => User, (user) => user.friendRequestsReceived, {
        onDelete: 'CASCADE'
    })
    receiver: User
}