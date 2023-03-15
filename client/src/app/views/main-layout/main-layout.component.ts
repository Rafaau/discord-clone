import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
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
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  members?: User[]
  currentUser?: User
  currentRoute = new LocationHrefProvider(this.location)
  @ViewChild(FriendsComponent) friendsChild?: FriendsComponent
  @ViewChild(DirectMessagesListComponent) directMessagesChild?: DirectMessagesListComponent
  @ViewChild(ChatServersComponent) chatServersChild?: ChatServersComponent
  cols = '3'

  displayMap = new Map([
    [Breakpoints.XSmall, '1'],
    [Breakpoints.Small, '1'],
    [Breakpoints.Medium, '2'],
    [Breakpoints.Large, '3'],
    [Breakpoints.XLarge, '3'],
  ])

  constructor(
    private breakpointsObserver: BreakpointObserver,
    private _authService: AuthService,
    public router: Router,
    private location: Location
  ) { 
      breakpointsObserver.observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge
      ]).subscribe(result =>  {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.cols = this.displayMap.get(query) as string
          }
        }
      })
    }

  async ngOnInit() {
    await this.authorizeUser()
  }

  fetchUsersFromServer(users: User[]) {
    this.members = users
  }

  async authorizeUser() {
    await this._authService.getAuthStatus().subscribe(
      (data: HttpResponse<User>) => {
        console.log('authorized')
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
}
