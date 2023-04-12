import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ChatCategory } from 'src/app/_models/chat-category';
import { ChatServer } from 'src/app/_models/chat-servers';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { AddChannelDialog } from './add-channel-dialog/add-channel-dialog.component';
import { Location } from '@angular/common';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { User } from 'src/app/_models/user';
import { UsersService } from 'src/app/_services/users.service';
import { AddCategoryDialog } from './add-category-dialog/add-category-dialog.component';
import { GenerateInvitationDialog } from './generate-invitation-dialog/generate-invitation.component';
import { ChatChannelService } from 'src/app/_services/chat-channel.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChatChannel, UpdateChatChannelParams } from 'src/app/_models/chat-channels';
import { Notification } from 'src/app/_models/notification';
import { NotificationsService } from 'src/app/_services/notifications.service';
import { ChannelPermissionsDialog } from './channel-permissions-dialog/channel-permissions.component';
import { RouteParamsProvider } from 'src/app/utils/RouteParamsProvider.service';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';
import { Subject, Subscription, filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat-channels',
  templateUrl: './chat-channels.component.html',
  styleUrls: ['./chat-channels.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('open', 
        style({
          transform: 'rotate(*)'
      })),
      state('closed',
        style({
          transform: 'rotate(-90deg) translateX(5px) translateY(5px)'
      })),
      transition('open => closed', [
        animate('0.15s')
      ]),
      transition('closed => open', [
        animate('0.15s')
      ])
    ])
  ]
})
export class ChatChannelsComponent implements OnInit, OnDestroy {
  chatServer?: ChatServer
  chatChannels?: ChatChannel[]
  toExpand: boolean[] = []
  isOpen: boolean[] = []
  isServerMenuExpanded: boolean = false
  isServerSettingsOn: boolean = false
  notifications: Notification[] = []
  currentUser?: User
  currentRoute = new LocationHrefProvider(this.location)
  currentChannelSettings?: ChatChannel
  doNotInterrupt: boolean = false // to avoid instant close (clickOutside)
  movedChannel?: ChatChannel
  categorySrc?: ChatCategory
  currentChannel: number = 0
  onDestroy$ = new Subject<void>()

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public dialog: MatDialog,
    private readonly routeParams: RouteParamsProvider,
    private readonly _chatServerService: ChatServerService,
    private readonly _usersService: UsersService,
    private readonly _chatChannelService: ChatChannelService,
    private readonly _notificationsService: NotificationsService,
    private readonly _sharedDataProvider: SharedDataProvider,
    private location: Location,
  ) { }

  ngOnInit() {
    this.init()
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url.includes('chatserver')
        && !event.url.includes(`chatserver/${this.chatServer?.id}`))
          this.init()
        else if (this.chatServer 
              && event.url.includes('chatserver')
              && !event.url.includes(`channel`)) 
          this.redirectToChatChannel(this.chatServer!.chatCategories![0].chatChannels![0].id)
      })
    this.getCurrentUser()
    this._chatChannelService.getCreatedCategory()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (category: ChatCategory) => {
          category.chatChannels = []
          this.chatServer!.chatCategories!.push(category)
        }
      )
    this._chatChannelService.getCreatedChannel()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (channel: ChatChannel) => {
          console.log(channel)
          const actualCategory = this.chatServer!.chatCategories!.find(category =>
            category.id == channel.chatCategory.id
          )!
          console.log(actualCategory)
          actualCategory.chatChannels.push(channel)
        }
      )
    this._chatChannelService.getDeletedChannel()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (channelId: number) => {
          const actualCategory = this.chatServer!.chatCategories!.find(category =>
            category.chatChannels.some(channel => channel.id == channelId)
          )!
          actualCategory.chatChannels = actualCategory.chatChannels.filter(x => x.id != channelId)
        }
      )
    this._chatChannelService.getMovedChannel()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (data: any) => {
          const actualCategory = this.chatServer!.chatCategories!
            .filter(x => x.id == data[0].id)[0]
          actualCategory.chatChannels = data[0].chatChannels
          const previousCategory = this.chatServer!.chatCategories!
          .filter(x => x.chatChannels
            .filter(x => x.id == data[1]) && x.id != actualCategory.id)[0]
          if (previousCategory)
            previousCategory.chatChannels = previousCategory.chatChannels.filter(x => x.id != data[1])
        }
      )
    this._chatChannelService.getUpdatedChannel()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (channel: ChatChannel) => {
          const actualChannel = this.chatChannels!.find(x => x.id == channel.id)!
          actualChannel.name = channel.name
          actualChannel.users = channel.users
          actualChannel.roles = channel.roles
          actualChannel.isPrivate = channel.isPrivate
        })
    this._sharedDataProvider.updatedServer
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
      (event: ChatServer) => {
        this.chatServer = event
      })

    const regex = /main:channel\/(\d+)/
    const match = this.router.url.match(regex)
    if (match) {
      this.currentChannel = parseInt(match[1])
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next()
    this.onDestroy$.complete()
  }

  init() {
    const serverId = this.route.snapshot.paramMap.get('serverId')
    this.getChatServerDetails(Number(serverId))
    this.fetchUsers(Number(serverId))
    this.getNotifications()
  }

  getCurrentUser() {
    this._sharedDataProvider.getCurrentUser().subscribe(
      (user: User) => {
        this.currentUser = user
      }
    )
  }

  getChatServerDetails(id: number) {
    this._chatServerService.getChatServerById(id).subscribe(
      (data: HttpResponse<ChatServer>) => {
        this.chatServer = data.body!
        for (let i = 0; i < data.body!.chatCategories!.length; i++) {
          this.toExpand.push(true)
        }

        this.chatChannels = data.body!.chatCategories!.map(x => x.chatChannels).flat()
        this.redirectToChatChannel(
          data.body!.chatCategories![0].chatChannels![0].id
        )
      },
      (error) => {
        console.log('err')
      }
    )
  }

  getNotifications() {
    this._sharedDataProvider.getServerNotifications()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (notifications: Notification[]) => {
          this.notifications = notifications
          if (notifications && notifications.length) {
            notifications.forEach(x => {
              if (x.source.includes(`Channel=${this.currentChannel}`)) {
                this._notificationsService.markAsRead(x.id, this.currentUser!.id)
              }
            })
          }
          // TO MAKE TIME FOR MARK AS READ FUNCTION WHILE RECIPIENT IS VIEWING CONVERSATION
          setTimeout(() => this.checkNotifications(), 1000)
        })
  }

  fetchUsers(chatServerId: number) {
    this._usersService.getUsersByChatServer(chatServerId).subscribe(
      (data: HttpResponse<User[]>) => {
        this._sharedDataProvider.setMembers(data.body!)
      },
      (error) => {
        console.log('err')
      }
    )
  }

  collapseCategory(index: number) {
    this.toExpand[index] = !this.toExpand[index]
    this.isOpen[index] = !this.isOpen[index]
  }

  redirectToChatChannel(channelId: number) {
    if (!this.doNotInterrupt) {
      this.router.navigate([{ outlets: { main: ['channel', channelId] } }])
      
      const notificationsFromChannel = this.notifications?.filter(
        x => x.source.includes(`Channel=${channelId}`)
      ) 
      notificationsFromChannel?.forEach(x => {
        this._notificationsService.markAsRead(x.id, this.currentUser!.id)
      })

      this.currentChannel = channelId
    }
  }

  openCreateChannelDialog(category: ChatCategory, doNotCollapse: number) {
    // To avoid collapse / expand category
    this.toExpand[doNotCollapse] = !this.toExpand[doNotCollapse]
    this.isOpen[doNotCollapse] = !this.isOpen[doNotCollapse]

    let dialogRef = this.dialog.open(AddChannelDialog, {
      data: { 
        categoryId: category.id, 
        categoryName: category.name,
        currentUser: this.currentUser, 
      },
      width: '420px',
      panelClass: 'dialog-container',
    })
    const sub = dialogRef.componentInstance.onCreate.subscribe(() => {
      this.getChatServerDetails(this.chatServer!.id)  
    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })
  }

  checkNotifications() {
    if (this.chatServer) {
      const { chatChannels } = this.chatServer.chatCategories![0];
      for (const channel of chatChannels) {
        const channelNotification = this.notifications.find(
          notification => notification.source.includes(`Channel=${channel.id}`)
        );
    
        if (!channelNotification) {
          channel.hasNotification = false;
          continue;
        }
    
        if (
          channelNotification.source
            .slice(channelNotification.source.indexOf("Channel="))
            .slice(8) ===
          this.currentRoute.route.slice(this.currentRoute.route.indexOf("channel=")).slice(8)
        ) {
          channel.hasNotification = false;
          this._notificationsService.markAsRead(channelNotification.id, this.currentUser!.id);
        } else {
          channel.hasNotification = true;
        }
      }
    }
  }

  deleteChannel() {
    this.doNotInterrupt = true
    this._chatChannelService.deleteChatChannel(this.currentChannelSettings!.id)
    setTimeout(() => {
      this.doNotInterrupt = false
    }, 500)
  }

  toggleServerMenu() {
    this.isServerMenuExpanded = !this.isServerMenuExpanded
  }

  openCreateCategoryDialog() {
    this.isServerMenuExpanded = false
    let dialogRef = this.dialog.open(AddCategoryDialog, {
      data: { serverId: this.chatServer!.id },
      width: '420px',
      panelClass: 'dialog-container',
    })
    const sub = dialogRef.componentInstance.onCreate.subscribe(() => {
      this.getChatServerDetails(this.chatServer!.id)  
    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })
  }

  openChannelPermissionsDialog() {
    let dialogRef = this.dialog.open(ChannelPermissionsDialog, {
      data: { 
        channel: this.currentChannelSettings, 
        members: this.chatServer!.members,
        roles: this.chatServer!.roles,
        currentUser: this.currentUser! 
      },
      width: '420px',
      panelClass: 'dialog-container',
    })
    this.currentChannelSettings = undefined
    const sub = dialogRef.componentInstance.onSaveEvent.subscribe(data => {
      const reqBody: UpdateChatChannelParams = {
        isPrivate: data.isPrivate,
        users: data.permittedUsers,
        roles: data.permittedRoles,
      }
      this._chatChannelService.updateChatChannel(data.channelId, reqBody)
      this.dialog.closeAll()
    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })
  }

  toggleServerSettings() {
    this.isServerSettingsOn = !this.isServerSettingsOn
    this.isServerMenuExpanded = false
    this._sharedDataProvider.emitServerSettings(this.chatServer!)
  }

  openGenerateInvitationDialog() {
    this.isServerMenuExpanded = false
    let dialogRef = this.dialog.open(GenerateInvitationDialog, {
      data: { serverId: this.chatServer!.id },
      width: '450px',
      panelClass: 'dialog-container',
    })
  }

  openChannelSettings(channel: ChatChannel) {
    this.doNotInterrupt = true
    this.currentChannelSettings = channel
    setTimeout(() => {
      this.doNotInterrupt = false
    }, 500)
  }

  closeChannelSettings() {
    if (!this.doNotInterrupt)
      this.currentChannelSettings = undefined
  }

  onChannelDrop(event: CdkDragDrop<ChatChannel[]>) {
    const previousIndex = event.previousIndex
    const destinationIndex = event.currentIndex
    const previousCategory = (event.previousContainer.data[0] as any).chatCategory.id
    const destinationCategory = (event.container.data[0] as any).chatCategory.id
    const channelId = (event.item.data as any).id
    this.movedChannel = event.item.data
    this.categorySrc = this.chatServer!.chatCategories!
      .filter(x => x.id == previousCategory)[0]
    this._chatChannelService.moveChannel(channelId, destinationIndex, destinationCategory)
  }

  isPermittedToManageServer() {
    if (this.currentUser && this.chatServer) {
      const currentChatServerId = this.chatServer.id
      const userRolesForCurrentServer = this.currentUser.roles!.filter(role => role.chatServer.id === currentChatServerId)
    
      return userRolesForCurrentServer.some(role => {
        return role.permissions.some(permission => permission['administrator'] === true)
      })
    } else
      return false
  }

  isPermittedToViewChannel(channel: ChatChannel) {
    if (this.currentUser) {
      const userRolesForCurrentServer = this.currentUser!.roles!.filter(role => role.chatServer.id == this.chatServer!.id)
      return userRolesForCurrentServer.some(role => {
        return channel.roles!.some(x => x.id == role.id)
      }) || channel.users!.some(x => x.id == this.currentUser!.id)
      || !channel.isPrivate 
    } else
      return false
  }

  availableChannels(channels: ChatChannel[]) {
    return channels ? channels.filter(x => this.isPermittedToViewChannel(x)) : []
  }
}
