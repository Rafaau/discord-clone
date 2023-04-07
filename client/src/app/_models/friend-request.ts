import { User } from "./user";

export interface FriendRequest {
    id: number,
    status: string,
    sender: User,
    receiver: User
}