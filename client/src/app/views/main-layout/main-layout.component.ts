import { animate, state, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { User } from 'src/app/_models/Users';
import { AuthService } from 'src/app/_services/auth.service';
import { UsersService } from 'src/app/_services/users.service';
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
  members?: User[]
  currentUser?: User
  currentRoute = new LocationHrefProvider(this.location)
  @ViewChild(FriendsComponent) friendsChild?: FriendsComponent
  @ViewChild(DirectMessagesListComponent) directMessagesChild?: DirectMessagesListComponent
  @ViewChild(ChatServersComponent) chatServersChild?: ChatServersComponent
  settingsState: boolean = false

  constructor(
    private _authService: AuthService,
    public router: Router,
    private location: Location
  ) { }

  async ngOnInit() {
    await this.authorizeUser()
  }

  fetchUsersFromServer(users: User[]) {
    this.members = users
  }

  refreshChatServers(event: Event) {
    this.chatServersChild?.getChatServers(this.currentUser!.id)
  }

  async authorizeUser() {
    await this._authService.getAuthStatus().subscribe(
      (data: HttpResponse<User>) => {
        console.log('authorized')
        console.log(data.body)
        this.currentUser = data.body!
        this.friendsChild?.fetchFriendsOfUser(data.body!.id)
        this.chatServersChild?.getChatServers(data.body!.id)
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

  toggleServerSettingsView(event: Event) {
    this.settingsState = !this.settingsState
  }
}
