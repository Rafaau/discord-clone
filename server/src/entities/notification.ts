import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    message: string

    @ManyToOne(() => User, user => user.notifications, {
        onDelete: 'CASCADE'
    })
    recipient: User

    @Column({ default: false })
    read: boolean

    @Column()
    source: string
}