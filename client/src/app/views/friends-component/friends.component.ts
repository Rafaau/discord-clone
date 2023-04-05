import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CreateDirectConversationParams, DirectConversation } from 'src/app/_models/direct-conversation';
import { FriendRequest } from 'src/app/_models/friend-request';
import { User, UserComplex } from 'src/app/_models/Users';
import { DirectConversationService } from 'src/app/_services/direct-conversation.service';
import { FriendRequestsService } from 'src/app/_services/friend-requests.service';
import { UsersService } from 'src/app/_services/users.service';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';
import { RemoveConfirmDialog } from './remove-confirm-dialog/remove-confirm-dialog.component';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit, OnDestroy {
  currentUser?: User
  friendsOfUser: UserComplex[] = []
  friendRequests: FriendRequest[] = []
  public searchValue: string = ''
  public ViewEnum = View
  currentView: View = View.FriendsList
  friendInputValue: string = ''
  onDestroy$ = new Subject<void>()
  invalidRequest: boolean = false
  successRequest: boolean = false
  doNotRedirect: boolean = false

  constructor(
    private readonly _usersService: UsersService,
    private readonly _directConversationService: DirectConversationService,
    private readonly _sharedDataProvider: SharedDataProvider,
    private readonly _friendRequestsService: FriendRequestsService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getCurrentUser()
    this._friendRequestsService.getNewFriendRequest()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (request: any) => {
          if (request[0].isSuccess && request[0].data.receiver.id == this.currentUser!.id)
            this.friendRequests.push(request[0].data)
          if (!request[0].isSuccess && request[1] == this.currentUser!.id)
            this.invalidRequest = true
          if (request[0].isSuccess && request[0].data.sender.id == this.currentUser!.id) {
            this.successRequest = true
            setTimeout(() => {
              this.successRequest = false
            }, 3000)
          }
        })
    this._friendRequestsService.getAcceptedFriendRequest()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (request: any) => {
          if (request.receiver.id == this.currentUser!.id) {
            this.friendRequests.filter(x => x.id == request.id)[0].status = request.status 
            this.friendsOfUser.push(request.sender)
          }
        })
    this._friendRequestsService.getDeclinedFriendRequest()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (request: any) => {
          this.friendRequests.filter(x => x.id == request.id)[0].status = request.status 
        })
  }

  ngOnDestroy() {
    this.onDestroy$.next()
    this.onDestroy$.complete()
  }

  getCurrentUser() {
    this._sharedDataProvider.getCurrentUser().subscribe(
      (user: User) => {
        if (user) {
          this.currentUser = user
          this.fetchFriendsOfUser(user.id)
          this.fetchFriendRequests(user.id)
        }
      })
  }

  fetchFriendsOfUser(userId: number) {
    this._usersService.getFriendsOfUser(userId)
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

  fetchFriendRequests(userId: number) {
    this._usersService.getFriendRequestsOfUser(userId)
      .subscribe(
        (data: HttpResponse<FriendRequest[]>) => {
          this.friendRequests = data.body!
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
      if (!this.doNotRedirect)
        this.router.navigate([{ outlets: { main: ['conversation', conversationId] } }])
    } else { // WHEN CONVERSATION DOES NOT EXIST, CREATING NEW ONE
      const reqBody: CreateDirectConversationParams = {
        users: [this.currentUser!, friend]
      }
      this._directConversationService.createDirectConversation(reqBody)
        .subscribe(
          (data: HttpResponse<DirectConversation>) => {
            if (!this.doNotRedirect)
              this.router.navigate([{ outlets: { main: ['conversation', data.body!.id] } }])
          },
          (error) => {
            console.log('err')
          }
        )
    }
  }

  removeFriend(friend: User) {
    this.doNotRedirect = true
    const dialogRef = this.dialog.open(RemoveConfirmDialog, {
      width: '350px',
      data: { friend: friend },
      panelClass: 'dialog-container',
    })

    const sub = dialogRef.componentInstance.onDeleteEvent
      .subscribe(() => { 
        this.dialog.closeAll()
        this._usersService.removeFriend(this.currentUser!.id, friend.id)
        .subscribe(
          (data: HttpResponse<any>) => {
            this.friendsOfUser = this.friendsOfUser.filter(x => x.id != friend.id)
          },
          (error) => {
            console.log('err')
          }
        )
      })
      dialogRef.afterClosed().subscribe(() => {
        sub.unsubscribe()
        this.doNotRedirect = false
      })
  }

  sendFriendRequest() {
    this._friendRequestsService
      .sendFriendRequest(this.currentUser!.id, this.friendInputValue)
    this.friendInputValue = ''
  }

  acceptFriendRequest(friendRequest: number) {
    this._friendRequestsService.acceptFriendRequest(friendRequest)
  }

  declineFriendRequest(friendRequest: number) {
    this._friendRequestsService.declineFriendRequest(friendRequest)
  }

  changeView(index: number) {
    this.currentView = index
  }
}

export enum View {
  FriendsList,
  Pending,
  AddFriend,
}