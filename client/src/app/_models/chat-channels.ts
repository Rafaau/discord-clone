import { ChatCategory } from "./chat-category";
import { ChatMessage } from "./chat-message";
import { Role } from "./role";
import { User } from "./Users";

export interface ChatChannel {
    id: number,
    name: string,
    index: number,
    chatCategory: ChatCategory,
    chatMessages: ChatMessage[],
    hasNotification?: boolean,
    isPrivate: boolean,
    users?: User[],
    roles?: Role[]
}

export interface CreateChatChannelParams {
    name: string,
    isPrivate: boolean,
    users?: User[],
    roles?: Role[]
}

export interface UpdateChatChannelParams {
    name?: string,
    isPrivate?: boolean,
    users?: User[],
    roles?: Role[]
}

