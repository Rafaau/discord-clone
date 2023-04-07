import { User } from "./user";

export interface Notification {
    id: number,
    message: string,
    recipient: User,
    read: boolean,
    source: string
}

export interface CreateNotificationParams {
    message: string,
    source: string
}