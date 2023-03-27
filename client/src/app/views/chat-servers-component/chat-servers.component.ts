import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ChatServer } from 'src/app/_models/chat-servers';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations'
import { AddServerDialog } from './add-server-dialog/add-server-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/_models/Users';
import { Notification } from 'src/app/_models/notification';
import { Socket } from 'ngx-socket-io';
import { NotificationsService } from 'src/app/_services/notifications.service';

@Component({
  selector: 'app-chat-servers',
  templateUrl: './chat-servers.component.html',
  styleUrls: ['./chat-servers.component.css'],
  animations: [
    trigger('routeChange', [
      transition(':enter', [
        style({
          transform: 'scaleY(0.5)'
        }),
        animate('0.3s cubic-bezier(0.35, 0, 0.25, 1.75)',
          style({
            transform: 'scaleY(1)'
        }))
      ]),
      transition(':leave', [
        animate('0.2s',
          style({
            transform: 'scaleY(0)'
          }))
      ])
    ])
  ]
})
export class ChatServersComponent implements OnInit, OnChanges {
  chatServers: ChatServer[] = []
  @Input()
  currentUser?: User
  notifications: Notification[] = []
  @Output()
  notificationsToPass = new EventEmitter<Notification[]>
  groupedNotifications: Array<Array<Notification>> = [
    [],
  ]

  constructor(
    private readonly _chatServerService: ChatServerService,
    private readonly _notificationsService: NotificationsService,
    private readonly socket: Socket,
    public router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.currentUser) {
      this.getChatServers(this.currentUser.id)
      this.getNotifications(this.currentUser.id)

      this._notificationsService.getNewNotification()
        .subscribe(
          (notification: Notification) => {
            if (notification.recipient.id == this.currentUser!.id) {
              this.notifications!.push(notification)
              this.groupNotifications()
              this.notificationsToPass.emit(this.notifications)
            }
          }
        )
      this._notificationsService.getReadedNotification()
          .subscribe(
            (notification: Notification) => {
              const notifications = this.notifications.filter(x => x.id != notification.id)
              this.notifications = notifications
              this.groupNotifications(notifications)
              this.notificationsToPass.emit(notifications)
            }
          )
    }
  }

  getChatServers(userId: number) {
    this._chatServerService.getUserChatServers(userId)
      .subscribe(
        (data: HttpResponse<ChatServer[]>) => {
          this.chatServers = data.body!
          console.log("servers fetched")
          for (let server of data.body!)
            this.groupedNotifications.push([])
        },
        (error) => {
          console.log('err')
        }
      )
  }

  getNotifications(userId: number) {
    this._notificationsService.getUnreadNotificationsForUser(userId)
      .subscribe(
        (data: HttpResponse<Notification[]>) => {
          this.notifications = data.body!
          console.log('notifications fetched')
          this.groupNotifications(data.body!)
          this.notificationsToPass.emit(data.body!)
        },
        (error) => {
          console.log(error)
        }
      )
  }

  groupNotifications(notifications?: Notification[]) {
    setTimeout(() => {
      this.groupedNotifications = Array.from(
        { length: this.chatServers.length + 1 },
        () => []
      )
      const data = notifications?.length ? notifications : this.notifications
      if (data.length) {
        data.forEach(notification => {
          this.chatServers.forEach((server, index) => {
            if (notification.source.includes(`ChatServer=${server.id}`))
              this.groupedNotifications[index + 1].push(notification)
          })
          if (notification.source.includes(`DirectConversation=`))
            this.groupedNotifications[0].push(notification)
        })
      }
    }, 100)
  }

  redirectTo(route: string) {
    this.router.navigate(
      ['/chatserver'], 
      { queryParams: { id: route } }
    )
  }

  redirectToHome() {
    this.router.navigate(['/directmessages'])
  }

  openAddServerDialog() {
    let dialogRef = this.dialog.open(AddServerDialog, {
      data: { name: 'Rafau' },
      width: '450px',
      panelClass: 'add-server-dialog',
      height: '272px'
    })
    const sub = dialogRef.componentInstance.onCreate.subscribe(() => {
      this.getChatServers(this.currentUser!.id)
      setTimeout(() => {
        const lastChatServer = this.chatServers.sort((a,b) => a.id - b.id)[this.chatServers.length - 1]
        this.router.navigate(
          ['/chatserver'], 
          { queryParams: { id: lastChatServer.id } }
        )
      }, 100)
    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })
  }
}
