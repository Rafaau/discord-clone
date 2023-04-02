import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatCategory } from 'src/app/_models/chat-category';
import { ChatServer } from 'src/app/_models/chat-servers';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { AddChannelDialog } from './add-channel-dialog/add-channel-dialog.component';
import { Location } from '@angular/common';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { User } from 'src/app/_models/Users';
import { UsersService } from 'src/app/_services/users.service';
import { AddCategoryDialog } from './add-category-dialog/add-category-dialog.component';
import { GenerateInvitationDialog } from './generate-invitation-dialog/generate-invitation.component';
import { ChatChannelService } from 'src/app/_services/chat-channel.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChatChannel, UpdateChatChannelParams } from 'src/app/_models/chat-channels';
import { Notification } from 'src/app/_models/notification';
import { NotificationsService } from 'src/app/_services/notifications.service';
import { ChannelPermissionsDialog } from './channel-permissions-dialog/channel-permissions.component';

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
export class ChatChannelsComponent implements OnInit, OnChanges {
  chatServer?: ChatServer
  chatChannels?: ChatChannel[]
  @Output()
  members = new EventEmitter<User[]>()
  toExpand: boolean[] = []
  isOpen: boolean[] = []
  isServerMenuExpanded: boolean = false
  isServerSettingsOn: boolean = false
  @Output()
  onServerSettingsToggle = new EventEmitter<ChatServer>
  @Input()
  notifications: Notification[] = []
  @Input()
  currentUser?: User
  currentRoute = new LocationHrefProvider(this.location)
  currentChannelSettings?: ChatChannel
  doNotInterrupt: boolean = false // to avoid instant close (clickOutside)
  movedChannel?: ChatChannel
  categorySrc?: ChatCategory

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public dialog: MatDialog,
    private readonly _chatServerService: ChatServerService,
    private readonly _usersService: UsersService,
    private readonly _chatChannelService: ChatChannelService,
    private readonly _notificationsService: NotificationsService,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(
      params => {
        if (this.router.url.includes('chatserver')) {
          this.getChatServerDetails(params['id'])
          this.fetchUsers(params['id'])
        }
      }
    )
    this._chatChannelService.getDeletedChannel()
      .subscribe(
        (channelId: number) => {
          const actualCategory = this.chatServer!.chatCategories!
            .filter(x => x.chatChannels
              .filter(x => x.id == channelId))[0]
          actualCategory.chatChannels = actualCategory.chatChannels.filter(x => x.id != channelId)
        }
      )
    this._chatChannelService.getMovedChannel()
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
      .subscribe(
        (channel: ChatChannel) => {
          const actualChannel = this.chatChannels!.find(x => x.id == channel.id)!
          actualChannel.name = channel.name
          actualChannel.users = channel.users
          actualChannel.roles = channel.roles
          actualChannel.isPrivate = channel.isPrivate
        })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['notifications'] && this.chatServer) {
      this.checkNotifications()
    }
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

  fetchUsers(chatServerId: number) {
    this._usersService.getUsersByChatServer(chatServerId).subscribe(
      (data: HttpResponse<User[]>) => {
        this.members?.emit(data.body!)
        console.log('users fetched')
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
      const url = this.router.createUrlTree(
        [], 
        { 
          relativeTo: this.route,
          queryParamsHandling: 'merge',
          queryParams: { 
            id: this.chatServer!.id,
            channel: channelId
          } 
        }
      ).toString()
      this.location.replaceState(url);
      
      const notificationsFromChannel = this.notifications.filter(
        x => x.source.includes(`Channel=${channelId}`)
      ) 
      notificationsFromChannel.forEach(x => {
        this._notificationsService.markAsRead(x.id, this.currentUser!.id)
      })
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
    const { chatChannels } = this.chatServer!.chatCategories![0];
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
    this.onServerSettingsToggle.emit(this.chatServer)
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
    console.log(destinationCategory)
    this._chatChannelService.moveChannel(channelId, destinationIndex, destinationCategory)
  }

  isPermittedToManageServer() {
    const currentChatServerId = this.chatServer!.id
    const userRolesForCurrentServer = this.currentUser!.roles!.filter(role => role.chatServer.id === currentChatServerId)
  
    return userRolesForCurrentServer.some(role => {
      return role.permissions.some(permission => permission['administrator'] === true)
    })
  }

  isPermittedToViewChannel(channel: ChatChannel) {
    const userRolesForCurrentServer = this.currentUser!.roles!.filter(role => role.chatServer.id == this.chatServer!.id)
    return userRolesForCurrentServer.some(role => {
      return channel.roles!.some(x => x.id == role.id)
    }) || channel.users!.some(x => x.id == this.currentUser!.id)
    || !channel.isPrivate
  }

  availableChannels(channels: ChatChannel[]) {
    return channels.filter(x => this.isPermittedToViewChannel(x))
  }
}
