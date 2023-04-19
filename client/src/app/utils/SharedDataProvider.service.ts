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
    private channelPage = new Map<number, number>()
    public userAvatarCache = new Map<number, boolean>()
    public serverSettings: EventEmitter<ChatServer> = new EventEmitter<ChatServer>()
    public updatedServer: EventEmitter<ChatServer> = new EventEmitter<ChatServer>()
    public updatedConversationsList: EventEmitter<void> = new EventEmitter<void>()
    public joinedServer: EventEmitter<ChatServer> = new EventEmitter<ChatServer>()
    public removedFromServer: EventEmitter<ChatServer> = new EventEmitter<ChatServer>()
    public updatedUser: EventEmitter<number> = new EventEmitter<number>()
    public voiceUser: EventEmitter<{ voiceChannelId: number, user: User, serverId: number }> = new EventEmitter<{ voiceChannelId: number, user: User, serverId: number }>()
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

    setChannelPage(channelId: number, page: number) {
        this.channelPage.set(channelId, page)
    }

    getChannelPage(channelId: number) {
        return this.channelPage.get(channelId)
    }

    emitServerSettings(server: ChatServer) {
        this.serverSettings.emit(server)
    }

    emitUpdatedServer(server: ChatServer) {
        this.updatedServer.emit(server)
    }

    emitUpdatedConversationsList() {
        this.updatedConversationsList.emit()
    }

    emitJoinedServer(server: ChatServer) {
        this.joinedServer.emit(server)
    }

    emitRemovedFromServer(server: ChatServer) {
        this.removedFromServer.emit(server)
    }

    emitUpdatedUser(userId: number) {
        this.updatedUser.emit(userId)
    }

    emitVoiceUser(voiceChannelId: number, user: User, serverId: number) {
        this.voiceUser.emit({ voiceChannelId, user, serverId })
    }
}