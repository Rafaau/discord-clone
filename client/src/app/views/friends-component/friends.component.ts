import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateDirectConversationParams, DirectConversation } from 'src/app/_models/direct-conversation';
import { User, UserComplex } from 'src/app/_models/Users';
import { DirectConversationService } from 'src/app/_services/direct-conversation.service';
import { UsersService } from 'src/app/_services/users.service';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  currentUser?: User
  friendsOfUser: UserComplex[] = []
  public searchValue: string = ''
  public ViewEnum = View
  currentView: View = View.FriendsList
  friendInputValue: string = ''

  constructor(
    private readonly _usersService: UsersService,
    private readonly _directConversationService: DirectConversationService,
    private readonly _sharedDataProvider: SharedDataProvider,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit() {
    this.getCurrentUser()
  }

  getCurrentUser() {
    this._sharedDataProvider.getCurrentUser().subscribe(
      (user: User) => {
        this.currentUser = user
        this.fetchFriendsOfUser()
      })
  }

  fetchFriendsOfUser(userId?: number) {
    this._usersService.getFriendsOfUser(userId ? userId : this.currentUser!.id)
    .subscribe(
      (data: HttpResponse<UserComplex[]>) => {
        this.friendsOfUser = data.body!
        console.log(data.body)
      },
      (error) => {
        console.log('err')
      }
    )
  }

  filterFriendsBySearch(friends: any[]): any[] {
    if (this.searchValue === '') {
      return friends
    }
    return friends.filter(f => f.username
      .toLowerCase()
      .includes(this.searchValue.toLowerCase())
    )
  }

  redirectToConversation(friend: UserComplex) {
    const conversation = friend.directConversations.filter(
      x => x.users.filter(
        x => x.id == this.currentUser!.id
      )
    )[0]

    if (conversation != undefined) { // WHEN CONVERSATION ALREADY EXISTS
      const conversationId = conversation.id
      const url = this.router.createUrlTree(
        [],
        {
          queryParamsHandling: 'merge',
          queryParams: {
            conversation: conversationId
          }
        }
      ).toString()
      this.location.replaceState(url)
    } else { // WHEN CONVERSATION DOES NOT EXIST, CREATING NEW ONE
      const reqBody: CreateDirectConversationParams = {
        users: [this.currentUser!, friend]
      }
      this._directConversationService.createDirectConversation(reqBody)
        .subscribe(
          (data: HttpResponse<DirectConversation>) => {
            const url = this.router.createUrlTree(
              [],
              {
                queryParamsHandling: 'merge',
                queryParams: {
                  conversation: data.body!.id
                }
              }
            ).toString()
            this.location.replaceState(url)
          },
          (error) => {
            console.log('err')
          }
        )
    }
  }

  changeView(index: number) {
    this.currentView = index
  }
}

export enum View {
  FriendsList,
  AddFriend,
}