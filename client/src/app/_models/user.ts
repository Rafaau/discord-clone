import { AppSettings, UpdateAppSettingsParams } from "./app-settings"
import { ChatChannel } from "./chat-channels"
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
    aboutMe?: string,
    currentVoiceChannel?: ChatChannel,
    appSettings: AppSettings
}

export interface UserComplex {
    id: number,
    username: string,
    email: string,
    directConversations: DirectConversation[]
    roles?: Role[]
    aboutMe?: string,
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
    password?: string,
    aboutMe?: string,
    appSettings: UpdateAppSettingsParams
}

export interface LoginUserParams {
    username: string,
    password: string
    rememberMe?: boolean
}