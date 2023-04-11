import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { DirectConversation } from 'src/app/_models/direct-conversation';
import { Notification } from 'src/app/_models/notification';
import { User } from 'src/app/_models/user';
import { NotificationsService } from 'src/app/_services/notifications.service';
import { UsersService } from 'src/app/_services/users.service';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';
import { indexOf } from 'lodash';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-direct-messages-list',
  templateUrl: './direct-messages-list.component.html',
  styleUrls: ['./direct-messages-list.component.css']
})
export class DirectMessagesListComponent implements OnInit, OnDestroy {
  currentUser?: User
  notifications: Notification[] = []
  directConversations?: DirectConversation[]
  currentConversation: number = 0
  onDestroy$ = new Subject<void>()

  constructor(
    private readonly _usersService: UsersService,
    private readonly _notificationsService: NotificationsService,
    private readonly _sharedDataProvider: SharedDataProvider,
    public router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {
    this.getCurrentUser()
    const regex = /main:conversation\/(\d+)/
    const match = this.router.url.match(regex)
    if (match) {
      this.currentConversation = parseInt(match[1])
    }
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
          this.fetchUserConversations(user.id)
          this.getNotifications()
        }
      })
  }

  getNotifications() {
    this._sharedDataProvider.getServerNotifications()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (notifications: Notification[]) => {
          this.notifications = notifications
          if (notifications && notifications.length) {
            notifications.forEach(x => {
              if (x.source.includes(`DirectConversation=${this.currentConversation}`)) {
                this._notificationsService.markAsRead(x.id, this.currentUser!.id)
              }
            })
          }
          // TO MAKE TIME FOR MARK AS READ FUNCTION WHILE RECIPIENT IS VIEWING CONVERSATION
          setTimeout(() => this.checkNotifications(), 1000)
        })
  }

  fetchUserConversations(userId: number) {
    this._usersService.getConversationsOfUser(userId)
      .subscribe(
        (data: HttpResponse<DirectConversation[]>) => {
          this.directConversations = data.body!
          this.checkNotifications()
        },
        (error) => {
          console.log('err')
        }
      )
  }

  checkNotifications() {
    this.directConversations!.forEach(conversation => {
      const source = `DirectConversation=${conversation.id}`
      const actualNotifications = this.notifications?.filter(x => x.source.includes(source))
      conversation.hasNotification = actualNotifications?.length > 0
      conversation.notificationsCount = conversation.hasNotification ? actualNotifications.length : 0
  
      const currentConversationId = this.router.url.slice(29)
      if (conversation.hasNotification && actualNotifications[0].source.slice(19) === currentConversationId) {
        conversation.hasNotification = false
        conversation.notificationsCount = 0
        this._notificationsService.markAsRead(actualNotifications[0].id, this.currentUser!.id)
      }
    })
  }

  redirectToConversation(conversationId: number) {
    this.router.navigate([{ outlets: { main: ['conversation', conversationId] } }])

    const notificationsFromConversation = this.notifications.filter(
      x => x.source.includes(`DirectConversation=${conversationId}`)
    ) 
    notificationsFromConversation.forEach(x => {
      this._notificationsService.markAsRead(x.id, this.currentUser!.id)
    })
    
    this.currentConversation = conversationId
  }

  redirectToFriends() {
    this.router.navigate([{ outlets: { main: 'friends', secondary: ['directmessages'] } }])
    this.currentConversation = 0
  }
}
