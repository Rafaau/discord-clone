import { DirectConversation } from "./direct-conversation"

export interface User {
    id: number,
    username: string,
    email: string,
    password: string,
    isOwner?: boolean
}

export interface UserComplex {
    id: number,
    username: string,
    email: string,
    directConversations: DirectConversation[]
}


export interface CreateUserParams {
    username: string,
    email: string,
    password: string,
    isOwner?: boolean
}

export interface LoginUserParams {
    username: string,
    password: string
}