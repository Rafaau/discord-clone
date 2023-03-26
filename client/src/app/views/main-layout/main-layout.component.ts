import { animate, state, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { ChatServer } from 'src/app/_models/chat-servers';
import { Notification } from 'src/app/_models/notification';
import { User } from 'src/app/_models/Users';
import { AuthService } from 'src/app/_services/auth.service';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { ChatChannelsComponent } from '../chat-channels-component/chat-channels.component';
import { ChatServerSettingsComponent } from '../chat-channels-component/chat-server-settings/chat-server-settings.component';
import { ChatServersComponent } from '../chat-servers-component/chat-servers.component';
import { DirectMessagesListComponent } from '../direct-messages-list-component/direct-messages-list.component';
import { FriendsComponent } from '../friends-component/friends.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  animations: [
    trigger('settingsToggle', [
      state('open', 
        style({
         opacity: 0,
         transform: 'scale(0.9)',
         filter: 'blur(4px)' 
        })),
      state('closed', 
        style({
          opacity: 1,
          transform: 'scale(*)'
        })),
      transition('closed => open', [
        animate('0.2s ease-in')
      ]),
      transition('open => closed', [
        animate('0.2s ease-out')
      ])
    ])
  ]
})
export class MainLayoutComponent implements OnInit {
  members: User[] = []
  notifications: Notification[] = []
  currentUser?: User
  currentRoute = new LocationHrefProvider(this.location)
  @ViewChild(FriendsComponent) friendsChild?: FriendsComponent
  @ViewChild(DirectMessagesListComponent) directMessagesChild?: DirectMessagesListComponent
  @ViewChild(ChatServersComponent) chatServersChild?: ChatServersComponent
  @ViewChild(ChatChannelsComponent) chatChannelsChild?: ChatChannelsComponent
  @ViewChild(ChatServerSettingsComponent) serverSettingsChild?: ChatServerSettingsComponent
  serverSettingsState: boolean = false
  userSettingsState: boolean = false
  chatServerToPass?: ChatServer

  constructor(
    private readonly _authService: AuthService,
    public router: Router,
    private location: Location
  ) { }

  async ngOnInit() {
    await this.authorizeUser()
  }

  fetchUsersFromServer(users: User[]) {
    this.members = users
  }

  fetchNotificationsFromServers(notifications: Notification[]) {
    this.notifications = notifications
    if (this.chatChannelsChild) {
      this.chatChannelsChild.notifications = notifications
      this.chatChannelsChild.checkNotifications()
    } else if (this.directMessagesChild) {
        this.directMessagesChild.notifications = notifications
        this.directMessagesChild.checkNotifications()
      }
  }

  refreshUser(user: User) {
    console.log(user)
    this.currentUser = user
  }

  refreshChatServers(event: Event) {
    this.chatServersChild?.getChatServers(this.currentUser!.id)
  }

  async authorizeUser() {
    await this._authService.getAuthStatus().subscribe(
      async (data: HttpResponse<User>) => {
        console.log('authorized')
        console.log(data.body)
        this.currentUser = data.body!
        this.friendsChild?.fetchFriendsOfUser(data.body!.id)
        //this.router.navigate(['/directmessages'])
      },
      (error) => {
        console.log('unauthorized')
        this.router.navigate(['/login'])
      }
    )
  }

  passUserToChild() {
    this.directMessagesChild?.fetchUserConversations(this.currentUser!.id)
  }

  toggleServerSettingsView(event: ChatServer) {
    this.serverSettingsState = !this.serverSettingsState
    if (event != undefined)
      this.chatServerToPass = event
    else
      this.chatServerToPass = undefined
  }

  updateChatServer(chatServer: ChatServer) {
    this.chatChannelsChild!.chatServer = chatServer
  }

  toggleUserSettingsView(event: Event) {
    this.userSettingsState = !this.userSettingsState
  }
}
