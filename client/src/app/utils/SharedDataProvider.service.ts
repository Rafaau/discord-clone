import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { User } from "../_models/Users";
import { ChatServer } from "../_models/chat-servers";
import { Notification } from "../_models/notification";

@Injectable({
    providedIn: "root"
})
export class SharedDataProvider {
    private currentUser = new BehaviorSubject<any>(null)
    private members = new BehaviorSubject<any>(null)
    private serverNotifications = new BehaviorSubject<any>(null)
    public serverSettings: EventEmitter<ChatServer> = new EventEmitter<ChatServer>()
    public updatedServer: EventEmitter<ChatServer> = new EventEmitter<ChatServer>()

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

    emitServerSettings(server: ChatServer) {
        this.serverSettings.emit(server)
    }

    emitUpdatedServer(server: ChatServer) {
        this.updatedServer.emit(server)
    }
}