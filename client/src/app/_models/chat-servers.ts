import { ChatCategory } from "./chat-category"
import { Role } from "./role"
import { User } from "./user"

export interface ChatServer {
    id: number,
    name: string,
    owner: User,
    members?: User[],
    chatCategories?: ChatCategory[],
    roles?: Role[]
}

export interface CreateChatServerParams {
    name: string
}

export interface UpdateChatServerParams {
    name: string
}