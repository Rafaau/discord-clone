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
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.rendered.emit(true)
    if (this.currentUser)
      this.fetchUserConversations()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['notifications'] && this.directConversations?.length) {
      this.checkNotifications()
    }
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
      if (this.notifications.length) {
        const actualNotifications = this.notifications
          .filter(x => x.source.includes(`DirectConversation=${conversation.id}`))
        if (actualNotifications[0]) {
          if (actualNotifications[0].source.slice(19) == this.currentRoute.route.slice(29)) {
            conversation.hasNotification = false
            conversation.notificationsCount = 0
            this._notificationsService.markAsRead(actualNotifications[0].id)
          } else {
            conversation.hasNotification = true
            conversation.notificationsCount = actualNotifications.length
          }
        } else {
          conversation.hasNotification = false
          conversation.notificationsCount = 0
        }
      } else {
        conversation.hasNotification = false
      }
    })
  }

  redirectToConversation(conversationId: number) {
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

    const notificationsFromConversation = this.notifications.filter(
      x => x.source.includes(`DirectConversation=${conversationId}`)
    ) 
    notificationsFromConversation.forEach(x => {
      this._notificationsService.markAsRead(x.id)
    })
  }

  redirectToFriends() {
    this.location.go('/directmessages')
  }
}
