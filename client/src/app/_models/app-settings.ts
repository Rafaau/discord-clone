import { User } from "./user";

export interface AppSettings {
    id: number,
    inputSensitivity: number,
    messageBadge: boolean,
    user: User
}

export interface UpdateAppSettingsParams {
    inputSensitivity: number,
    messageBadge: boolean,
}