import { ChatMessage } from "./chat-message";
import { DirectMessage } from "./direct-message";
import { User } from "./user";

export interface MessageReaction {
    id: number,
    reaction: string,
    user: User,
    chatMessage?: ChatMessage,
    directMessage?: DirectMessage
}

export interface CreateMessageReactionParams {
    reaction: string
}