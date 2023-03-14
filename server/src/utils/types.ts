import { User } from "src/typeorm/user"

export type CreateUserParams = {
    username: string
    email: string
    password: string
}

export type UpdateUserParams = {
    username: string
    email: string
    password: string
    phonenumber: string
}

export type CreateChatServerParams = {
    name: string
}

export type CreateChatCategoryParams = {
    name: string
}

export type CreateChatChannelParams = {
    name: string
}

export type CreateChatMessageParams = {
    content: string
}

export type CreateDirectConversationParams = {
    users: User[]
}

export type CreateDirectMessageParams = {
    content: string
}

export type UpdateMessageParams = {
    content: string
}