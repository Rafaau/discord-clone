import { DirectConversation } from "./direct-conversation"
import { Role } from "./role"

export interface User {
    id: number,
    username: string,
    email: string,
    password: string,
    rawPassword?: string,
    phoneNumber?: string,
    isOwner?: boolean
    roles?: Role[]
}

export interface UserComplex {
    id: number,
    username: string,
    email: string,
    directConversations: DirectConversation[]
    roles?: Role[]
}


export interface CreateUserParams {
    username: string,
    email: string,
    password: string,
    isOwner?: boolean
}

export interface UpdateUserParams {
    username: string,
    email: string,
    phoneNumber: string,
    password?: string
}

export interface LoginUserParams {
    username: string,
    password: string
    rememberMe?: boolean
}