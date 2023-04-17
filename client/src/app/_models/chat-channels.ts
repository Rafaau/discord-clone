import { ChatCategory } from "./chat-category";
import { ChatMessage } from "./chat-message";
import { Role } from "./role";
import { User } from "./user";

export interface ChatChannel {
    id: number,
    name: string,
    index: number,
    type: ChannelType,
    chatCategory: ChatCategory,
    chatMessages: ChatMessage[],
    hasNotification?: boolean,
    isPrivate: boolean,
    users?: User[],
    roles?: Role[],
    voiceUsers?: User[]
}

export interface CreateChatChannelParams {
    name: string,
    type: ChannelType,
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

export enum ChannelType {
    Text = 'text',
    Voice = 'voice'
}

