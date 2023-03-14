import { ChatChannel } from "./chat-channels";
import { ChatServer } from "./chat-servers";

export interface ChatCategory {
    id: number,
    name: string,
    chatServer: ChatServer,
    chatChannels: ChatChannel[]
}

export interface CreateChatCategoryParams {
    name: string
}