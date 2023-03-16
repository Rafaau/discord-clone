import { ChatServer } from "./chat-servers";

export interface ChatServerInvitation {
    id: number,
    url: string,
    expirationTime: Date,
    chatServer: ChatServer
}