import { Location, ViewportScroller } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { ChatChannel } from 'src/app/_models/chat-channels';
import { ChatMessage, CreateChatMessageParams, UpdateChatMessageParams } from 'src/app/_models/chat-message';
import { User } from 'src/app/_models/Users';
import { ChatChannelService } from 'src/app/_services/chat-channel.service';
import { ChatMessagesService } from 'src/app/_services/chat-messages.service';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { UsersService } from 'src/app/_services/users.service';
import { ConfirmDeleteDialog } from './confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: [
    './chat-messages.component.css',
    '../chat-channels-component/chat-channels.component.scss'
  ]
})
export class ChatMessagesComponent implements OnInit, OnDestroy {
  @Input()
  public members?: User[] = []
  @Input()
  currentUser?: User
  @Output()
  onJoinCallback = new EventEmitter()
  currentRoute = new LocationHrefProvider(this.location)
  chatMessages: ChatMessage[] = []
  chatChannel?: ChatChannel
  showMembers: boolean = true
  messageValue: string = ''
  doNotScroll: boolean = false
  messageToEditId: number = 0
  messageToEditValue: string = ''
  currentMemberDetails: number = 0
  detailsToggle: number = 0
  currentMemberOptions: number = 0
  showEmojiPicker: boolean = false
  martToggle: number = 0
  page: number = 1
  loading: boolean = false

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private readonly _chatMessagesService: ChatMessagesService,
    private readonly _chatChannelsService: ChatChannelService,
    private readonly _usersService: UsersService,
    private readonly _chatServerService: ChatServerService,
    public dialog: MatDialog,
    private socket: Socket
  ) { }

  ngOnInit() {
    this.init()
    this.location.onUrlChange(() => {
      this.chatMessages = []
      this.page = 1
      this.init()
    })
    this._chatMessagesService.getNewMessage()
      .subscribe(
        (message: ChatMessage) => {
          this.chatMessages.push(message)
          document.getElementById('target')?.scrollIntoView()
        }
      )
    this._chatMessagesService.getEditedMessage()
      .subscribe(
        (message: ChatMessage) => {
          this.chatMessages.filter(x => x.id == message.id)[0].content = message.content
        }
      )
    this._chatMessagesService.getDeletedMessage()
        .subscribe(
          (messageId: number) => {
            this.chatMessages = this.chatMessages.filter(x => x.id != messageId)
          }
        )
  }

  ngOnDestroy() {
    this.socket.removeAllListeners('newChatMessage')
  }

  init() {
    this.doNotScroll = false
    const params = new URLSearchParams(this.currentRoute.route)
    if (this.page == 1) {
      this.fetchChatMessages(Number(params.get('channel')))
      this.getChatChannel(Number(params.get('channel')))
    }
    setTimeout(() => {
      this.doNotScroll = true // to avoid scrolling on tooltip display
    }, 500)
  }

  fetchChatMessages(channelId: number) {
      this._chatMessagesService.getChatMessages(channelId, this.page).subscribe(
        (data: HttpResponse<ChatMessage[]>) => {
          if (this.page > 1)
            this.chatMessages = this.chatMessages.concat(data.body!)
          else
            this.chatMessages = data.body!
          console.log('messages fetched')
        },
        (error) => {
          console.log('err')
        }
      )
  }

  scrollToLastMessage() {
    if (!this.doNotScroll)
      document.getElementById('target')?.scrollIntoView()
  }

  scrollAfterPageFetch() {
    document.getElementsByClassName('single-message')[9]?.scrollIntoView({ behavior: 'smooth' })
  }

  getChatChannel(channelId: number) {
    this._chatChannelsService.getChatChannelById(channelId).subscribe(
      (data: HttpResponse<ChatChannel>) => {
        this.chatChannel = data.body!
      }
    )
  }

  hideShowMembers() {
    this.showMembers = !this.showMembers
  }

  onValueChange(event: Event) {
    const value = (event.target as any).value
    this.messageValue = value
  }

  onSubmit(event: Event) {
    if (this.messageValue != '') {
      const reqBody: CreateChatMessageParams = {
        content: this.messageValue
      }
      this._chatMessagesService.sendMessage(
        this.chatChannel!.id,
        this.currentUser!.id,
        reqBody
      )
      this.messageValue = ''
      var element = document.getElementsByClassName('chat-input')[0] as HTMLTextAreaElement
      setTimeout(() => {
        element.value = ''
      }, 0)
    }
  }

  onEdit(message: ChatMessage) {
    this.messageToEditId = message.id
    this.messageToEditValue = message.content
  }

  onEditValueChange(event: Event) {
    const value = (event.target as any).value;
    this.messageToEditValue = value
  }

  exitEditMode(event: Event) {
    this.messageToEditId = 0
    this.messageToEditValue = ''
  }

  onEditSubmit(event: Event) {
    console.log('entered')
    if (this.messageToEditValue != '') {
      const reqBody: UpdateChatMessageParams = {
        content: this.messageToEditValue
      }
      this._chatMessagesService.editMessage(this.messageToEditId, reqBody)
      var element = document.getElementsByClassName('edit-input')[0] as HTMLTextAreaElement
      setTimeout(() => {
        element.value = ''
      }, 0)
      this.messageToEditId = 0
      this.messageToEditValue = ''
    }
  }

  openConfirmDelete(message: ChatMessage) {
    message.chatChannel = this.chatChannel!
    let dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      data: { message: message },
      width: '450px',
      panelClass: 'dialog-container'
    })
    const sub = dialogRef.componentInstance.onDeleteEvent.subscribe(() => {
      this.fetchChatMessages(this.chatChannel!.id)
    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })
  }

  openMemberDetails(userId: number) {
    this.currentMemberDetails = userId
    this.detailsToggle = 0
  }

  closeMemberDetails(event: Event) {
    if (this.detailsToggle != 0) {
      this.currentMemberDetails = 0
      this.detailsToggle = 0
    }
    else
      this.detailsToggle = 1
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker
    this.martToggle = 0
  }

  closeEmojiPicker(event: Event) {
    if (this.martToggle != 0) {
      this.showEmojiPicker = false
      this.martToggle = 0
    }
    else
      this.martToggle = 1
  }

  addEmojiToMessage(event: Event) {
    this.messageValue += (event as any).emoji.native
    this.showEmojiPicker = false
  }

  onMemberRightClick(userId: number) {
    if (this.currentUser!.id == this.members!.filter(x => x.isOwner == true)[0].id) {
      this.currentMemberOptions = userId
      return false
    }
      return true
  }

  onKickMember(userId: number) {
    let chatServerId: number = 0
    this.route.queryParams.subscribe(
      params => {
        chatServerId = params['id']
      }
    )
    this._chatServerService.removeMemberFromChatServer(chatServerId, userId)
    .subscribe(
      (data: HttpResponse<any>) => {
        this.members = this.members!.filter(x => x.id != userId)
        this.currentMemberOptions = 0
      },
      (error) => {
        console.log('err')
      }
    )
  }

  closeMemberOptions(event: Event) {
    this.currentMemberOptions = 0
  }

  handleJoinCallback(event: Event) {
    this.onJoinCallback.emit()
  }

  onScroll() {
    if (!this.loading && !this.orderByPostDate(this.chatMessages)[0].isFirst) {
      console.log('scrolled')
      this.loading = true
      setTimeout(() => {
        this.page++
        this.fetchChatMessages(this.chatChannel!.id)
        this.loading = false
        this.scrollAfterPageFetch()
      }, 1000)
    }
  }

  isToday(date: Date) {
    return new Date(date).getDate() == new Date().getDate()
  }

  isYesterday(date: Date) {
    return new Date(date).getDate() == (new Date().getDate())-1
  }

  isLongAgo(date: Date) {
    return new Date(date).getDate() < (new Date().getDate())-1
  }

  toDate(date: Date) {
    return new Date(date).getDate()
  }

  orderByPostDate(chatMessages: any[]): any[] {
    return chatMessages.sort((a, b) => a.postDate > b.postDate ? 1 : -1)
  }
}