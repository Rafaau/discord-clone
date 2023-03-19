import { ChatChannel } from "./chat-channels";
import { MessageReaction } from "./message-reaction";
import { User } from "./Users";

export interface ChatMessage {
    id: number,
    content: string,
    postDate: Date,
    user: User,
    chatChannel: ChatChannel
    isFirst?: boolean,
    reactions?: MessageReaction[]
}

export interface CreateChatMessageParams {
    content: string
}

export interface UpdateChatMessageParams {
    content: string
}