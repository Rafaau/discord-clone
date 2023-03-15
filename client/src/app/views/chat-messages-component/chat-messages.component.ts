import { Location, ViewportScroller } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VERSION } from '@angular/platform-browser-dynamic';
import { ActivatedRoute, Router } from '@angular/router';
import { EmojiService } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { ChatChannel } from 'src/app/_models/chat-channels';
import { ChatMessage, CreateChatMessageParams, UpdateChatMessageParams } from 'src/app/_models/chat-message';
import { User } from 'src/app/_models/Users';
import { ChatChannelService } from 'src/app/_services/chat-channel.service';
import { ChatMessagesService } from 'src/app/_services/chat-messages.service';
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
export class ChatMessagesComponent implements OnInit {
  @Input()
  public members?: User[] = []
  @Input()
  currentUser?: User
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
  showEmojiPicker: boolean = false
  martToggle: number = 0

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private readonly _chatMessagesService: ChatMessagesService,
    private readonly _chatChannelsService: ChatChannelService,
    private readonly _usersService: UsersService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.init()
    this.location.onUrlChange(() => {
      this.init()
    })
  }

  init() {
    this.doNotScroll = false
    const params = new URLSearchParams(this.currentRoute.route)
    this.fetchChatMessages(Number(params.get('channel')))
    this.getChatChannel(Number(params.get('channel')))
    setTimeout(() => {
      this.doNotScroll = true // to avoid scrolling on tooltip display
    }, 500)
  }

  fetchChatMessages(channelId: number) {
      this._chatMessagesService.getChatMessages(channelId).subscribe(
        (data: HttpResponse<ChatMessage[]>) => {
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
      this._chatMessagesService.postChatMessage(this.chatChannel!.id, this.currentUser!.id, reqBody)
        .subscribe(
          (data: HttpResponse<{}>) => {
            this.messageValue = ''
            var element = document.getElementsByClassName('chat-input')[0] as HTMLTextAreaElement
            setTimeout(() => {
              element.value = ''
            }, 0)
            this.fetchChatMessages(this.chatChannel!.id)
          },
          (error) => {
            console.log('err')
          }
        )
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
      this._chatMessagesService.updateChatMessage(this.messageToEditId, reqBody)
        .subscribe(
          (data: HttpResponse<{}>) => {
            var element = document.getElementsByClassName('edit-input')[0] as HTMLTextAreaElement
            setTimeout(() => {
              element.value = ''
            }, 0)
            this.fetchChatMessages(this.chatChannel!.id)
            this.messageToEditId = 0
            this.messageToEditValue = ''
          },
          (error) => {
            console.log('err')
          }
        )
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
}