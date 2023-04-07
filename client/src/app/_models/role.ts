import { ChatServer } from "./chat-servers"
import { Permission } from "./permission"
import { User } from "./user"

export interface Role {
    id: number
    name: string
    description: string
    permissions: []
    chatServer: ChatServer
    users: User[]
}

export interface UpdateRoleParams {
    name?: string
    permissions?: []
}