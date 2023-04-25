import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity({ name: "app-settings" })
export class AppSettings {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: 35 })
    inputSensitivity: number

    @Column({ default: true })
    messageBadge: boolean

    @OneToOne(() => User, (user) => user.appSettings, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        cascade: true,
    })
    user: User

    constructor(user?: User) {
        if (user) {
            this.user = user
        }
    }
}