import { DirectMessage } from "./direct-message";
import { User, UserComplex } from "./Users";

export interface DirectConversation {
    id: number,
    users: User[],
    directMessages?: DirectMessage[],
    hasNotification?: boolean
    notificationsCount?: number,
}

export interface CreateDirectConversationParams {
    users: (User | UserComplex)[]
}