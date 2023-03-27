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

export type CreateMessageReactionParams = {
    reaction: string
}

export type CreateNotificationParams = {
    message: string
    source: string
}

export type UpdateChatServerParams = {
    name: string
}

export type UpdateRoleParams = {
    name: string
}