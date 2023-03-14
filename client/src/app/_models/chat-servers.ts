import { ChatCategory } from "./chat-category"
import { User } from "./Users"

export interface ChatServer {
    id: number,
    name: string,
    owner: User,
    members?: User[],
    chatCategories?: ChatCategory[]
}

export interface CreateChatServerParams {
    name: string
}