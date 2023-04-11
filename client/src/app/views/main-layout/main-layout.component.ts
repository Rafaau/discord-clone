import { animate, state, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { ChatServer } from 'src/app/_models/chat-servers';
import { Notification } from 'src/app/_models/notification';
import { Role } from 'src/app/_models/role';
import { User } from 'src/app/_models/user';
import { AuthService } from 'src/app/_services/auth.service';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { RolesService } from 'src/app/_services/roles.service';
import { ChatChannelsComponent } from '../chat-channels-component/chat-channels.component';
import { ChatServerSettingsComponent } from '../chat-channels-component/chat-server-settings/chat-server-settings.component';
import { ChatServersComponent } from '../chat-servers-component/chat-servers.component';
import { DirectMessagesListComponent } from '../direct-messages-list-component/direct-messages-list.component';
import { FriendsComponent } from '../friends-component/friends.component';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';
import { Subject, takeUntil } from 'rxjs';

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
export class MainLayoutComponent implements OnInit, OnDestroy {
  members: User[] = []
  notifications: Notification[] = []
  currentUser?: User
  currentRoute = new LocationHrefProvider(this.location)
  @ViewChild(ChatServersComponent) chatServersChild?: ChatServersComponent
  @ViewChild(ChatServerSettingsComponent) serverSettingsChild?: ChatServerSettingsComponent
  serverSettingsState: boolean = false
  userSettingsState: boolean = false
  chatServerToPass?: ChatServer
  onDestroy$ = new Subject<void>()

  constructor(
    private readonly _authService: AuthService,
    private readonly _rolesService: RolesService,
    private readonly _sharedDataProvider: SharedDataProvider,
    public router: Router,
    private location: Location
  ) { }

  async ngOnInit() {
    await this.authorizeUser()
    this._rolesService.getRoleUpdated()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((role: Role) => {
        if (role.users.some(x => x.id == this.currentUser!.id)) {
          this.currentUser!.roles!.find(x => x.id == role.id)!.permissions = role.permissions
        }
      })
    this._sharedDataProvider.serverSettings.subscribe((event: ChatServer) => {
      this.serverSettingsState = !this.serverSettingsState
      if (event != undefined)
        this.chatServerToPass = event
      else
        this.chatServerToPass = undefined
    })
    if (this.router.url == '/')
      this.router.navigate([{ outlets: { main: 'friends', secondary: 'directmessages' } }])
  }

  ngOnDestroy() {
    this.onDestroy$.next()
    this.onDestroy$.complete()
  }


  fetchUsersFromServer(users: User[]) {
    this.members = users
  }

  fetchNotificationsFromServers(notifications: Notification[]) {
    this.notifications = notifications
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
        this.currentUser = data.body!
        this._sharedDataProvider.setCurrentUser(this.currentUser)
        this._authService.joinRoom(this.currentUser!.id.toString())
        this.router.navigate
      },
      (error) => {
        console.log('unauthorized')
        this.router.navigate([''])
          .then(() => {
            this.router.navigate(['login'])
          })
      }
    )
  }

  toggleServerSettingsView(event: ChatServer) {
    this.serverSettingsState = !this.serverSettingsState
    if (event != undefined)
      this.chatServerToPass = event
    else
      this.chatServerToPass = undefined
  }

  toggleUserSettingsView(event: Event) {
    this.userSettingsState = !this.userSettingsState
  }
}
