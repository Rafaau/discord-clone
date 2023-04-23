import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
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
import { User } from 'src/app/_models/user';
import { Notification } from 'src/app/_models/notification';
import { Socket } from 'ngx-socket-io';
import { NotificationsService } from 'src/app/_services/notifications.service';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';
import { Subject, takeUntil } from 'rxjs';

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
export class ChatServersComponent implements OnInit, OnChanges, OnDestroy {
  chatServers: ChatServer[] = []
  @Input()
  currentUser?: User
  @Input()
  isMobile?: boolean
  notifications: Notification[] = []
  @Output()
  notificationsToPass = new EventEmitter<Notification[]>
  @Output()
  updateUser = new EventEmitter<number>()
  groupedNotifications: Array<Array<Notification>> = [
    [],
  ]
  onDestroy$ = new Subject<void>()

  constructor(
    private readonly _chatServerService: ChatServerService,
    private readonly _notificationsService: NotificationsService,
    private readonly _sharedDataProvider: SharedDataProvider,
    private readonly socket: Socket,
    public router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this._chatServerService.getDeletedChatServer()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (chatServer: ChatServer) => {
          this.chatServers = this.chatServers.filter(x => x.id != chatServer.id)
          if (this.router.url.includes(`chatserver/${chatServer.id}`))
            this.router.navigate([''])
              .then(() => {
                this.router.navigate([{ outlets: { main: 'friends', secondary: ['directmessages'] } }])
              })
        })
    this._sharedDataProvider.joinedServer
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (chatServer: ChatServer) => {
          this.chatServers.push(chatServer)
          this.getNotifications(this.currentUser!.id)
        })
    this._chatServerService.getRemovedMember()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (data: any) => {
          if (data.userId == this.currentUser!.id) {
            this.chatServers = this.chatServers.filter(x => x.id != data.chatServer.id)
            if (this.router.url.includes(`chatserver/${data.chatServer.id})`))
              this.router.navigate([''])
                .then(() => {
                  this.router.navigate([{ outlets: { main: 'friends', secondary: ['directmessages'] } }])
              })
          } 
      })
    this._notificationsService.getNewNotification()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (notification: Notification) => {
          if (notification.recipient.id == this.currentUser!.id) {
            this.notifications!.push(notification)
            this.groupNotifications()
            this._sharedDataProvider.setServerNotifications(this.notifications)
          }
        }
      )
    this._notificationsService.getReadedNotification()
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(
          (notification: Notification) => {
            const notifications = this.notifications.filter(x => x.id != notification.id)
            this.notifications = notifications
            this.groupNotifications(notifications)
            this._sharedDataProvider.setServerNotifications(notifications)
          }
        )  
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.currentUser) {
      this.getChatServers(this.currentUser.id)
      this.getNotifications(this.currentUser.id)
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next()
    this.onDestroy$.complete()
  }

  getChatServers(userId: number) {
    this._chatServerService.getUserChatServers(userId)
      .subscribe(
        (data: HttpResponse<ChatServer[]>) => {
          this.chatServers = data.body!
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
          this.groupNotifications(data.body!)
          this._sharedDataProvider.setServerNotifications(data.body!)
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

  redirectTo(serverId: string) {
    this.router.navigate([{ outlets: { main: null, secondary: ['chatserver', serverId] } }])
  }
  
  redirectToHome() {
    this.router.navigate([''])
      .then(() => {
        this.router.navigate([{ outlets: { main: 'friends', secondary: ['directmessages'] } }])
      })
  }

  openAddServerDialog() {
    let dialogRef = this.dialog.open(AddServerDialog, {
      data: { currentUser: this.currentUser },
      width: '450px',
      panelClass: 'add-server-dialog',
      height: !this.isMobile ? '272px' : '310px'
    })
    const sub = dialogRef.componentInstance.onCreate.subscribe(() => {
      this.getChatServers(this.currentUser!.id)
      setTimeout(() => {
        const lastChatServer = this.chatServers.sort((a,b) => a.id - b.id)[this.chatServers.length - 1]
        this.updateUser.emit(this.currentUser!.id)
        this.router.navigate([{ outlets: { main: null, secondary: ['chatserver', lastChatServer.id] } }])
      }, 100)
    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })
  }
}
