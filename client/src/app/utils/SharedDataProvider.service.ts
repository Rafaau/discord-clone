import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { User } from "../_models/user";
import { ChatServer } from "../_models/chat-servers";
import { Notification } from "../_models/notification";
import { ChatMessage } from "../_models/chat-message";
import { MessageReaction } from "../_models/message-reaction";
import { DirectMessage } from "../_models/direct-message";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root"
})
export class SharedDataProvider {
    private currentUser = new BehaviorSubject<any>(null)
    private members = new BehaviorSubject<any>(null)
    private serverNotifications = new BehaviorSubject<any>(null)
    private cachedChatMessages = new Map<number, ChatMessage[]>()
    private cachedUpdatedChatMessages = new Map<number, ChatMessage[]>()
    private deletedMessageIds: number[] = []
    private cachedMessageReactions = new Map<number, MessageReaction[]>()
    private deletedMessageReactions = new Map<number, number[]>()
    private cachedDirectMessages = new Map<number, DirectMessage[]>()
    private cachedUpdatedDirectMessages = new Map<number, DirectMessage[]>()
    private deletedDirectMessageIds: number[] = []
    public userAvatarCache = new Map<number, HTMLImageElement>()
    public serverSettings: EventEmitter<ChatServer> = new EventEmitter<ChatServer>()
    public updatedServer: EventEmitter<ChatServer> = new EventEmitter<ChatServer>()
    readonly api = environment.apiUrl+'/users/getAvatar/user-'

    setCurrentUser(user: User) {
        this.currentUser.next(user)
    }

    getCurrentUser() {
        return this.currentUser.asObservable()
    }

    setMembers(members: User[]) {
        this.members.next(members)
    }

    getMembers() {
        return this.members.asObservable()
    }

    setServerNotifications(notifications: Notification[]) {
        this.serverNotifications.next(notifications)
    }

    getServerNotifications() {
        return this.serverNotifications.asObservable()
    }

    addToCachedChatMessages(message: ChatMessage) {
        const chatChannelId = message.chatChannel.id
        const messages = this.cachedChatMessages.get(chatChannelId) || []
        messages.push(message)
        this.cachedChatMessages.set(chatChannelId, messages)
    }

    getCachedChatMessages(chatChannelId: number) {
        return this.cachedChatMessages.get(chatChannelId) || []
    }

    clearCachedChatMessages(chatChannelId: number) {
        this.cachedChatMessages.delete(chatChannelId)
    }

    addToCachedUpdatedChatMessages(message: ChatMessage) {
        const chatChannelId = message.chatChannel.id
        const messages = this.cachedUpdatedChatMessages.get(chatChannelId) || []
        messages.push(message)
        this.cachedUpdatedChatMessages.set(chatChannelId, messages)
    }

    getCachedUpdatedChatMessages(chatChannelId: number) {
        return this.cachedUpdatedChatMessages.get(chatChannelId) || []
    }

    clearCachedUpdatedChatMessages(chatChannelId: number) {
        this.cachedUpdatedChatMessages.delete(chatChannelId)
    }

    addDeletedMessageId(messageId: number) {
        this.deletedMessageIds.push(messageId)
    }

    getDeletedMessageIds() {
        return this.deletedMessageIds
    }

    clearDeletedMessageId(messageId: number) {
        this.deletedMessageIds = this.deletedMessageIds.filter(x => x != messageId)
    }

    addToCachedMessageReactions(messageReaction: MessageReaction) {
        const messageId = messageReaction.chatMessage ? 
            messageReaction.chatMessage.id : messageReaction.directMessage!.id
        const reactions = this.cachedMessageReactions.get(messageId) || []
        reactions.push(messageReaction)
        this.cachedMessageReactions.set(messageId, reactions)
    }

    getCachedMessageReactions(messageId: number) {
        return this.cachedMessageReactions.get(messageId) || []
    }

    clearCachedMessageReactions(messageId: number) {
        this.cachedMessageReactions.delete(messageId)
    }

    addDeletedMessageReaction(messageId: number, reactionId: number) {
        const reactionIds = this.deletedMessageReactions.get(messageId) || []
        reactionIds.push(reactionId)
        this.deletedMessageReactions.set(messageId, reactionIds)
    }

    getDeletedMessageReactions(messageId: number) {
        return this.deletedMessageReactions.get(messageId) || []
    }

    clearDeletedMessageReaction(messageId: number) {
        this.deletedMessageReactions.delete(messageId)
    }

    addToCachedDirectMessages(message: DirectMessage) {
        const conversationId = message.directConversation.id
        const messages = this.cachedDirectMessages.get(conversationId) || []
        messages.push(message)
        this.cachedDirectMessages.set(conversationId, messages)
    }

    getCachedDirectMessages(conversationId: number) {
        return this.cachedDirectMessages.get(conversationId) || []
    }

    clearCachedDirectMessages(conversationId: number) {
        this.cachedDirectMessages.delete(conversationId)
    }

    addToCachedUpdatedDirectMessages(message: DirectMessage) {
        const conversationId = message.directConversation.id
        const messages = this.cachedUpdatedDirectMessages.get(conversationId) || []
        messages.push(message)
        this.cachedUpdatedDirectMessages.set(conversationId, messages)
    }

    getCachedUpdatedDirectMessages(conversationId: number) {
        return this.cachedUpdatedDirectMessages.get(conversationId) || []
    }

    clearCachedUpdatedDirectMessages(conversationId: number) {
        this.cachedUpdatedDirectMessages.delete(conversationId)
    }

    addDeletedDirectMessageId(messageId: number) {
        this.deletedDirectMessageIds.push(messageId)
    }

    getDeletedDirectMessageIds() {
        return this.deletedDirectMessageIds
    }

    clearDeletedDirectMessageId(messageId: number) {
        this.deletedDirectMessageIds = this.deletedDirectMessageIds.filter(x => x != messageId)
    }

    emitServerSettings(server: ChatServer) {
        this.serverSettings.emit(server)
    }

    emitUpdatedServer(server: ChatServer) {
        this.updatedServer.emit(server)
    }
}