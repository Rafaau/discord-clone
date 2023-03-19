import { animate, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { DirectConversation } from 'src/app/_models/direct-conversation';
import { CreateDirectMessageParams, DirectMessage, UpdateDirectMessageParams } from 'src/app/_models/direct-message';
import { CreateMessageReactionParams, MessageReaction } from 'src/app/_models/message-reaction';
import { User } from 'src/app/_models/Users';
import { DirectConversationService } from 'src/app/_services/direct-conversation.service';
import { DirectMessageService } from 'src/app/_services/direct-message.service';
import { MessageReactionsService } from 'src/app/_services/message-reactions.service';
import { ConfirmDeleteDialog } from '../chat-messages-component/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-direct-messages',
  templateUrl: './direct-messages.component.html',
  styleUrls: [
    './direct-messages.component.css',
    '../chat-channels-component/chat-channels.component.scss'
  ],
  animations: [
    trigger('onMartToggle', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(50px)'
        }),
        animate('0.2s cubic-bezier(0.35, 0, 0.25, 1.75)',
          style({
            opacity: 1,
            transform: 'translateY(*)'
          }))
      ]),
      transition(':leave',
        animate('0.1s',
          style({
            opacity: 0,
            transform: 'translateY(-50px)'
          })))
    ])
  ]
})
export class DirectMessagesComponent implements OnInit, OnDestroy {
  @Input()
  currentUser?: User
  @Output()
  onJoinCallback = new EventEmitter()
  currentRoute = new LocationHrefProvider(this.location)
  directConversation?: DirectConversation
  directMessages: DirectMessage[] = []
  doNotScroll: boolean = false
  messageValue: string = ''
  messageToEditId: number = 0
  messageToEditValue: string = ''
  showEmojiPicker: boolean = false
  martToggle: number = 0
  page: number = 1
  loading: boolean = false
  showReactionsPicker: boolean = false
  reactionsMartToggle: number = 0
  messageToReact: number = 0
  groupToIncrement = [0, '']

  constructor(
    private location: Location,
    private readonly _directConversationService: DirectConversationService,
    private readonly _directMessageService: DirectMessageService,
    private readonly _messageReactionsService: MessageReactionsService,
    public dialog: MatDialog,
    private socket: Socket
  ) { }

  ngOnInit() {
    this.init()
    this.location.onUrlChange(() => {
      this.directMessages = []
      this.page = 1
      this.init()
    })
    this._directMessageService.getNewMessage()
      .subscribe(
        (message: DirectMessage) => {
          this.directMessages.push(message)
          document.getElementById('target')?.scrollIntoView()
        }
      )
    this._directMessageService.getEditedMessage()
      .subscribe(
        (message: DirectMessage) => {
          this.directMessages.filter(x => x.id == message.id)[0].content = message.content
        }
      )
    this._directMessageService.getDeletedMessage()
        .subscribe(
          (messageId: number) => {
            this.directMessages = this.directMessages.filter(x => x.id != messageId)
          }
        )
    this._messageReactionsService.getNewMessageReaction()
    .subscribe(
      (reaction: MessageReaction) => {
        this.directMessages.filter(x => x.id == reaction.directMessage!.id)[0].reactions!.push(reaction)
      }
    )
    this._messageReactionsService.getDeletedReaction()
      .subscribe(
        (data: any) => {
          this.directMessages.filter(x => x.id == data[1])[0].reactions =
            this.directMessages.filter(x => x.id == data[1])[0].reactions!.filter(x => x.id != data[0])
        }
      )        
  }

  ngOnDestroy() {
    this.socket.removeAllListeners('newDirectMessage')
    this.socket.removeAllListeners('editedDirectMessage')
  }

  init() {
    this.doNotScroll = false
    const urlObj = new URL(window.location.href)
    const params = new URLSearchParams(urlObj.search)
    if (this.page == 1) {
      this.fetchDirectConversation(Number(params.get('conversation')))
      this.fetchDirectMessages(Number(params.get('conversation')))
    }
    setTimeout(() => {
      this.doNotScroll = true // to avoid scrolling on tooltip display
    }, 500)
  }

  scrollToLastMessage() {
    if (!this.doNotScroll)
      document.getElementById('target')?.scrollIntoView()
  }

  scrollAfterPageFetch() {
    document.getElementsByClassName('single-message')[9]?.scrollIntoView({ behavior: 'smooth' })
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
        },
        (error) => {
          console.log('error')
        }
      )
  }

  fetchDirectMessages(conversationId: number) {
    this._directMessageService.getDirectMessagesByConversation(conversationId, this.page)
      .subscribe(
        (data: HttpResponse<DirectMessage[]>) => {
          console.log('messages fetched')
          if (this.page > 1)
            this.directMessages = this.directMessages.concat(data.body!)
          else
            this.directMessages = data.body!
        },
        (error) => {
          console.log('err')
        }
      )
  }

  onSubmit(event: Event) {
    if (this.messageValue != '') {
      const reqBody: CreateDirectMessageParams = {
        content: this.messageValue
      }
      this._directMessageService.sendMessage(
        this.directConversation!.id, 
        this.currentUser!.id,
        reqBody
      )
      this.messageValue = '';
      var element = document.getElementsByClassName('chat-input')[0] as HTMLTextAreaElement
      setTimeout(() => {
        element.value = ''
      }, 0)
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
      this._directMessageService.editMessage(this.messageToEditId, reqBody)
      var element = document.getElementsByClassName('edit-input')[0] as HTMLTextAreaElement
      setTimeout(() => {
        element.value = ''
      }, 0)
      this.messageToEditId = 0
      this.messageToEditValue = ''
    }
  }

  openConfirmDelete(message: DirectMessage) {
    let dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      data: { message: message },
      width: '450px',
      panelClass: 'dialog-container'
    })
    const sub = dialogRef.componentInstance.onDeleteEvent.subscribe(() => {
      this.fetchDirectMessages(this.directConversation!.id)
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

  handleJoinCallback(event: Event) {
    this.onJoinCallback.emit()
  }

  toggleReactionsMart(messageId: number) {
    if (this.messageToReact == messageId)
      this.showReactionsPicker = !this.showReactionsPicker
    else
      this.showReactionsPicker = true
    this.reactionsMartToggle = 0
    this.messageToReact = messageId
  }

  closeReactionsMart(event: Event) {
    if (this.reactionsMartToggle != 0) {
      this.showReactionsPicker = false
      this.reactionsMartToggle = 0
      this.messageToReact = 0
    }
    else
      this.reactionsMartToggle = 1  
  }

  sendReaction(messageId: number, event: Event) {
    const reqBody: CreateMessageReactionParams = {
      reaction: (event as any).emoji.native
    }
    this._messageReactionsService.sendMessageReaction(
      reqBody,
      this.currentUser!.id,
      undefined,
      messageId
    )
    this.messageToReact = 0
    this.showReactionsPicker = false
  } 

  addOrRemoveReaction(messageId: number, reactionGroup: any) {
    this.groupToIncrement = reactionGroup.reaction
    if (this.isReactedByCurrentUser(reactionGroup.users)) {
      this.groupToIncrement = [0, reactionGroup.reaction]
      const reaction = reactionGroup.objects.filter((x: { user: { id: number; }; }) => x.user.id == this.currentUser!.id)[0] // 22 23
      this._messageReactionsService
        .deleteMessageReaction(reaction.id, reaction.directMessage!.id)
    } else {
      this.groupToIncrement = [1, reactionGroup.reaction]
      const eventObj: any = { 
        emoji: {
          native: reactionGroup.reaction
        }
      }
      this.sendReaction(messageId, eventObj)
    }
    setTimeout(() => {
      this.groupToIncrement = [0, '']
    }, 300)
  }

  getReactionGroups(reactions: MessageReaction[]) {
    const reactionGroups = reactions.reduce((accumulator: any, reaction) => {
      const index = accumulator.findIndex(
        (group: { reaction: string; }) => group.reaction === reaction.reaction
      )
      if (index !== -1) {
        accumulator[index].count++
        if (!accumulator[index].users.some((x: { id: number; }) => x.id == reaction.user.id))
          accumulator[index].users.push(reaction.user)
        accumulator[index].objects.push(reaction)
      } else {
        accumulator.push({ 
          reaction: reaction.reaction, 
          count: 1, 
          users: [reaction.user],
          objects: [reaction],
        })
      }
      return accumulator
    }, [])
    return reactionGroups
  }

  isReactedByCurrentUser(users: User[]) {
    return users.some(x => x.id == this.currentUser?.id)
  } 

  onScroll() {
    if (!this.loading && !this.orderByPostDate(this.directMessages)[0].isFirst) {
      console.log('scrolled')
      this.loading = true
      setTimeout(() => {
        this.page++
        this.fetchDirectMessages(this.directConversation!.id)
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
