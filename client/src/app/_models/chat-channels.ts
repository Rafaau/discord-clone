import { ChatCategory } from "./chat-category";
import { ChatMessage } from "./chat-message";

export interface ChatChannel {
    id: number,
    name: string,
    index: number,
    chatCategory: ChatCategory,
    chatMessages: ChatMessage[],
}

export interface CreateChatChannelParams {
    name: string
}

