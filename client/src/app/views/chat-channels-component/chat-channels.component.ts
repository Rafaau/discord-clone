import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { ChannelType, ChatChannel, UpdateChatChannelParams } from 'src/app/_models/chat-channels';
import { Notification } from 'src/app/_models/notification';
import { NotificationsService } from 'src/app/_services/notifications.service';
import { ChannelPermissionsDialog } from './channel-permissions-dialog/channel-permissions.component';
import { RouteParamsProvider } from 'src/app/utils/RouteParamsProvider.service';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';
import { Subject, Subscription, filter, takeUntil } from 'rxjs';
import { VoiceService } from 'src/app/_services/voice.service';
import Peer, { MediaConnection } from 'peerjs';

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
  channelType = ChannelType
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
  currentVoiceChannel?: ChatChannel
  peer?: Peer
  channelPeers: Peer[] = []
  peerId: string = 'empty'
  currentPeer: any
  peerList: any[] = []
  peerToCall: string = ''
  currentConnection: MediaConnection | null = null
  @ViewChild('remoteAudio') remoteAudio?: ElementRef

  onPeerValueChange(event: Event) {
    this.peerToCall = (event.target as any).value
  }

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
    private readonly _voiceService: VoiceService,
    private location: Location,
  ) { 
    this.peer = new Peer()
  }

  ngOnInit() {
    this.init()
    this.router.events
      .pipe(takeUntil(this.onDestroy$))
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url.includes('chatserver')
        && !event.url.includes(`chatserver/${this.chatServer?.id}`))
          this.init()
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
        (channel: ChatChannel) => {
          const actualCategory = this.chatServer!.chatCategories!.find(category =>
            category.chatChannels.some(channel => channel.id == channel.id)
          )!
          actualCategory.chatChannels = actualCategory.chatChannels.filter(x => x.id != channel.id)
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
    this._voiceService.getJoinedVoiceChannel()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (data) => {
          console.log(`User ${data.user.id} has joined channel ${data.voiceChannelId}`)
          const actualChannel = this.chatServer!.chatCategories!.find(category => 
            category.chatChannels.some(channel => channel.id == data.voiceChannelId)
          )!.chatChannels.find(channel => channel.id == data.voiceChannelId)!
          if (!actualChannel.voiceUsers)
            actualChannel.voiceUsers = []
          actualChannel.voiceUsers!.push(data.user)
        })
    this._voiceService.getLeftVoiceChannel()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (data) => {
          console.log(`User ${data.user.id} has left channel ${data.voiceChannelId}`)
          const actualChannel = this.chatServer!.chatCategories!.find(category => 
            category.chatChannels.some(channel => channel.id == data.voiceChannelId)
          )!.chatChannels.find(channel => channel.id == data.voiceChannelId)!
          actualChannel.voiceUsers = actualChannel.voiceUsers!.filter(x => x.id != data.user.id)
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
    console.log(serverId)
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
        
        this.chatChannels.forEach(x => {
          if (x.type == this.channelType.Voice)
            this.channelPeers.push(new Peer(`channel-${x.id}`))
        })
        this.initPeerConnection()

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

  joinVoiceChannel(channel: ChatChannel) {
    this._voiceService.joinVoiceChannel(this.currentUser!.id, channel.id)
    this.currentVoiceChannel = channel
    const joinSound = document.getElementById('joinSound')! as HTMLAudioElement
    joinSound.currentTime = 0
    joinSound.play()
    this.callPeer(`channel-${channel.id}`)
  }
  
  leaveVoiceChannel(channelId: number) {
    this._voiceService.leaveVoiceChannel(this.currentUser!.id, this.currentVoiceChannel!.id)
    this.currentConnection?.close()
    const leaveSound = document.getElementById('leaveSound')! as HTMLAudioElement
    leaveSound.currentTime = 0
    leaveSound.play()
    this.currentVoiceChannel = undefined
  }

  initPeerConnection() {
    this.peer?.on('open', id => {
      console.log('open')
      this.peerId = id
    })

    this.channelPeers.forEach(x => {
      x.on('open', id => {
        console.log('open')
      })

      x.on('call', call => {
        console.log('called')
        navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
          video: false 
        }).then(stream => {
          call.answer(stream)
          call.on('stream', remoteStream => {
            console.log('rec')
            this.currentPeer = call.peerConnection
            this.peerList.push(call.peer)
            this.remoteAudio!.nativeElement.srcObject = remoteStream
          })
        }).catch(err => {
          console.log(err)
        })
      })
    })

    this.peer?.on('call', call => {
      console.log('called')
      navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: false 
      }).then(stream => {
        call.answer(stream)
        call.on('stream', remoteStream => {
          console.log('rec')
          this.currentPeer = call.peerConnection
          this.peerList.push(call.peer)
          this.remoteAudio!.nativeElement.srcObject = remoteStream
        })
      }).catch(err => {
        console.log(err)
      })
    })
  }

  callPeer(id: string) {
    navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
      video: false 
    }).then(stream => {
      const call = this.peer!.call(id, stream)
      this.currentConnection = call
      call!.on('stream', remoteStream => {
        console.log('stream')
        if (!this.peerList.includes(call.peer)) {
          this.currentPeer = call.peerConnection
          this.peerList.push(call.peer)
          const audio = document.createElement('audio');
          audio.style.display = "none";
          this.remoteAudio!.nativeElement.srcObject = remoteStream;
          document.body.appendChild(audio);
        }
      })
    }).catch(err => {
      console.log(err)
    })
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
