import { User } from "./Users";

export interface FriendRequest {
    id: number,
    status: string,
    sender: User,
    receiver: User
}