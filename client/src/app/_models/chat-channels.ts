import { ChatCategory } from "./chat-category";
import { ChatMessage } from "./chat-message";

export interface ChatChannel {
    id: number,
    name: string,
    index: number,
    chatCategory: ChatCategory,
    chatMessages: ChatMessage[],
    hasNotification?: boolean
}

export interface CreateChatChannelParams {
    name: string
}

