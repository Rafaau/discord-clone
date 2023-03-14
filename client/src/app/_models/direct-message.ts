import { DirectConversation } from "./direct-conversation";
import { User } from "./Users";

export interface DirectMessage {
    id: number,
    content: string,
    user: User,
    directConversation: DirectConversation,
    postDate: Date
}

export interface CreateDirectMessageParams {
    content: string
}

export interface UpdateDirectMessageParams {
    content: string
}