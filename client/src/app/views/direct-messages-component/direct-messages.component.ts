import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { DirectConversation } from 'src/app/_models/direct-conversation';
import { CreateDirectMessageParams, DirectMessage, UpdateDirectMessageParams } from 'src/app/_models/direct-message';
import { User } from 'src/app/_models/Users';
import { DirectConversationService } from 'src/app/_services/direct-conversation.service';
import { DirectMessageService } from 'src/app/_services/direct-message.service';
import { ConfirmDeleteDialog } from '../chat-messages-component/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-direct-messages',
  templateUrl: './direct-messages.component.html',
  styleUrls: [
    './direct-messages.component.css',
    '../chat-channels-component/chat-channels.component.scss'
  ]
})
export class DirectMessagesComponent implements OnInit {
  @Input()
  currentUser?: User
  currentRoute = new LocationHrefProvider(this.location)
  directConversation?: DirectConversation
  directMessages: DirectMessage[] = []
  doNotScroll: boolean = false
  messageValue: string = ''
  messageToEditId: number = 0
  messageToEditValue: string = ''
  showEmojiPicker: boolean = false
  martToggle: number = 0

  constructor(
    private location: Location,
    private readonly _directConversationService: DirectConversationService,
    private readonly _directMessageService: DirectMessageService,
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
    const urlObj = new URL(window.location.href)
    const params = new URLSearchParams(urlObj.search)
    this.fetchDirectConversation(Number(params.get('conversation')))
    setTimeout(() => {
      this.doNotScroll = true // to avoid scrolling on tooltip display
    }, 500)
  }

  scrollToLastMessage() {
    if (!this.doNotScroll)
      document.getElementById('target')?.scrollIntoView()
  }

  onValueChange(event: Event) {
    const value = (event.target as any).value;
    this.messageValue = value;
  }

  fetchDirectConversation(conversationId: number) {
    this._directConversationService.getDirectConversationById(conversationId)
      .subscribe(
        (data: HttpResponse<DirectConversation>) => {
          console.log(data.body)
          this.directConversation = data.body!
          this.directMessages = data.body!.directMessages
        },
        (error) => {
          console.log('error')
        }
      )
  }

  onSubmit(event: Event) {
    if (this.messageValue != '') {
      const reqBody: CreateDirectMessageParams = {
        content: this.messageValue
      }
      this._directMessageService.createDirectMessage(
        this.directConversation!.id, 
        this.currentUser!.id, 
        reqBody
      ).subscribe(
          (data: HttpResponse<any>) => {
            this.messageValue = '';
            var element = document.getElementsByClassName('chat-input')[0] as HTMLTextAreaElement
            setTimeout(() => {
              element.value = ''
            }, 0)
            this.fetchDirectConversation(this.directConversation!.id)
            document.getElementById('target')?.scrollIntoView()
          },
          (error) => {
            console.log('err')
          }
        )
    }
  }

  onEdit(message: DirectMessage) {
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
      const reqBody: UpdateDirectMessageParams = {
        content: this.messageToEditValue
      }
      this._directMessageService.updateDirectMessage(this.messageToEditId, reqBody)
        .subscribe(
          (data: HttpResponse<{}>) => {
            var element = document.getElementsByClassName('edit-input')[0] as HTMLTextAreaElement
            setTimeout(() => {
              element.value = ''
            }, 0)
            this.fetchDirectConversation(this.directConversation!.id)
            this.messageToEditId = 0
            this.messageToEditValue = ''
          },
          (error) => {
            console.log('err')
          }
        )
    }
  }

  openConfirmDelete(message: DirectMessage) {
    let dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      data: { message: message },
      width: '450px',
      panelClass: 'dialog-container'
    })
    const sub = dialogRef.componentInstance.onDeleteEvent.subscribe(() => {
      this.fetchDirectConversation(this.directConversation!.id)
    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })
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
