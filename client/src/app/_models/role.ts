import { ChatServer } from "./chat-servers"
import { Permission } from "./permission"
import { User } from "./Users"

export interface Role {
    id: number
    name: string
    description: string
    permissions: Permission[]
    chatServer: ChatServer
    users: User[]
}

export interface UpdateRoleParams {
    name?: string
}