import { ChatCategory } from "./chat-category";
import { ChatMessage } from "./chat-message";

export interface ChatChannel {
    id: number,
    name: string,
    chatCategory: ChatCategory,
    chatMessages: ChatMessage[],
}

export interface CreateChatChannelParams {
    name: string
}

