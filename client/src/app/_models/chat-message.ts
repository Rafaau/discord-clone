import { ChatChannel } from "./chat-channels";
import { User } from "./Users";

export interface ChatMessage {
    id: number,
    content: string,
    postDate: Date,
    user: User,
    chatChannel: ChatChannel
    isFirst?: boolean
}

export interface CreateChatMessageParams {
    content: string
}

export interface UpdateChatMessageParams {
    content: string
}