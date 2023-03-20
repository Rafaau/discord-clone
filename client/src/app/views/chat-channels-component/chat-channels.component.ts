import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
export class ChatChannelsComponent implements OnInit {
  chatServer?: ChatServer
  @Output()
  members = new EventEmitter<User[]>()
  toExpand: boolean[] = []
  isOpen: boolean[] = []
  isServerMenuExpanded: boolean = false
  isServerSettingsOn: boolean = false
  @Output()
  onServerSettingsToggle = new EventEmitter()
  currentRoute = new LocationHrefProvider(this.location)
  currentChannelSettings: number = 0
  doNotInterrupt: boolean = false // to avoid instant close (clickOutside)

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public dialog: MatDialog,
    private readonly _chatServerService: ChatServerService,
    private readonly _usersService: UsersService,
    private readonly _chatChannelService: ChatChannelService,
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
  }

  getChatServerDetails(id: number) {
    this._chatServerService.getChatServerById(id).subscribe(
      (data: HttpResponse<ChatServer>) => {
        this.chatServer = data.body!
        for (let i = 0; i < data.body!.chatCategories!.length; i++) {
          this.toExpand.push(true)
        }
        console.log(data.body)
        this.redirectToChatChannel(
          this.orderById(
            data.body!.chatCategories![0].chatChannels!
          )[0].id
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
    }
  }

  openCreateChannelDialog(category: ChatCategory, doNotCollapse: number) {
    // To avoid collapse / expand category
    this.toExpand[doNotCollapse] = !this.toExpand[doNotCollapse]
    this.isOpen[doNotCollapse] = !this.isOpen[doNotCollapse]

    let dialogRef = this.dialog.open(AddChannelDialog, {
      data: { categoryId: category.id, categoryName: category.name },
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

  deleteChannel() {
    this.doNotInterrupt = true
    this._chatChannelService.deleteChatChannel(this.currentChannelSettings)
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

  toggleServerSettings() {
    this.isServerSettingsOn = !this.isServerSettingsOn
    this.isServerMenuExpanded = false
    this.onServerSettingsToggle.emit()
  }

  openGenerateInvitationDialog() {
    this.isServerMenuExpanded = false
    let dialogRef = this.dialog.open(GenerateInvitationDialog, {
      data: { serverId: this.chatServer!.id },
      width: '450px',
      panelClass: 'dialog-container',
    })
  }

  openChannelSettings(channelId: number) {
    this.doNotInterrupt = true
    this.currentChannelSettings = channelId
    setTimeout(() => {
      this.doNotInterrupt = false
    }, 500)
  }

  closeChannelSettings() {
    if (!this.doNotInterrupt)
      this.currentChannelSettings = 0
  }

  orderById(chatChannels: any[]): any[] {
    return chatChannels.sort((a, b) => a.id > b.id ? 1 : -1)
  }
}
