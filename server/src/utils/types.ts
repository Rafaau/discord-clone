import { Role } from "src/entities/role"
import { User } from "src/entities/user"

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
    aboutMe: string
    appSettings: UpdateAppSettingsParams
}

export type CreateChatServerParams = {
    name: string
}

export type CreateChatCategoryParams = {
    name: string
}

export type CreateChatChannelParams = {
    name: string,
    isPrivate: boolean,
    users?: User[]
}

export type UpdateChatChannelParams = {
    name?: string,
    isPrivate?: boolean,
    users?: User[],
    roles?: Role[]
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
    name: string,
    permissions: any[]
}

export type UpdateAppSettingsParams = {
    id: number,
    inputSensitivity: number,
    messageBadge: boolean,
}