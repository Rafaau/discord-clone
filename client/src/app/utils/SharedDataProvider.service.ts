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
    public userAvatarCache = new Map<number, HTMLImageElement>()
    public serverSettings: EventEmitter<ChatServer> = new EventEmitter<ChatServer>()
    public updatedServer: EventEmitter<ChatServer> = new EventEmitter<ChatServer>()
    public updatedConversationsList: EventEmitter<void> = new EventEmitter<void>()
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
}