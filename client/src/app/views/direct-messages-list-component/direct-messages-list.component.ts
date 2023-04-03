import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { DirectConversation } from 'src/app/_models/direct-conversation';
import { Notification } from 'src/app/_models/notification';
import { User } from 'src/app/_models/Users';
import { NotificationsService } from 'src/app/_services/notifications.service';
import { UsersService } from 'src/app/_services/users.service';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';

@Component({
  selector: 'app-direct-messages-list',
  templateUrl: './direct-messages-list.component.html',
  styleUrls: ['./direct-messages-list.component.css']
})
export class DirectMessagesListComponent implements OnInit, OnChanges {
  @Input()
  currentUser?: User
  @Output()
  rendered = new EventEmitter<boolean>()
  @Input()
  notifications: Notification[] = []
  directConversations?: DirectConversation[]
  currentRoute = new LocationHrefProvider(this.location)

  constructor(
    private readonly _usersService: UsersService,
    private readonly _notificationsService: NotificationsService,
    private readonly _sharedDataProvider: SharedDataProvider,
    public router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.rendered.emit(true)
    this.getCurrentUser()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['notifications'] && this.directConversations?.length) {
      this.checkNotifications()
    }
  }

  getCurrentUser() {
    this._sharedDataProvider.getCurrentUser().subscribe(
      (user: User) => {
        this.currentUser = user
        this.fetchUserConversations()
      })
  }

  fetchUserConversations(userId?: number) {
    console.log('fetching')
    this._usersService.getConversationsOfUser(userId ? userId : this.currentUser!.id)
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
      const actualNotifications = this.notifications.filter(x => x.source.includes(source))
      conversation.hasNotification = actualNotifications.length > 0
      conversation.notificationsCount = conversation.hasNotification ? actualNotifications.length : 0
  
      const currentConversationId = this.currentRoute.route.slice(29)
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
  }

  redirectToFriends() {
    this.router.navigate([{ outlets: { main: 'friends', secondary: ['directmessages'] } }])
  }
}
