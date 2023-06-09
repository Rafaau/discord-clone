import { DirectConversation } from "./direct-conversation";
import { MessageReaction } from "./message-reaction";
import { User } from "./user";

export interface DirectMessage {
    id: number,
    content: string,
    user: User,
    directConversation: DirectConversation,
    postDate: Date,
    isFirst?: boolean,
    reactions?: MessageReaction[]
}

export interface CreateDirectMessageParams {
    content: string
}

export interface UpdateDirectMessageParams {
    content: string
}