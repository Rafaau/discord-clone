import { animate, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Socket } from 'ngx-socket-io';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { DirectConversation } from 'src/app/_models/direct-conversation';
import { CreateDirectMessageParams, DirectMessage, UpdateDirectMessageParams } from 'src/app/_models/direct-message';
import { CreateMessageReactionParams } from 'src/app/_models/message-reaction';
import { User } from 'src/app/_models/Users';
import { DirectConversationService } from 'src/app/_services/direct-conversation.service';
import { DirectMessageService } from 'src/app/_services/direct-message.service';
import { GiphyService } from 'src/app/_services/giphy.service';
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
export class DirectMessagesComponent implements OnInit {
  @Input()
  currentUser?: User
  @Output()
  onJoinCallback = new EventEmitter()
  @ViewChild('wrapper') myScrollContainer?: ElementRef
  currentRoute = new LocationHrefProvider(this.location)
  directConversation?: DirectConversation
  directMessages: DirectMessage[] = []
  doNotScroll: boolean = false
  messageValue: string = ''
  messageToEditId: number = 0
  messageToEditValue: string = ''
  interlocutor?: User
  showEmojiPicker: boolean = false
  martToggle: boolean = false
  page: number = 1
  loading: boolean = false
  showReactionsPicker: boolean = false
  reactionsMartToggle: number = 0
  messageToReact: number = 0
  searchTerm: string = ''
  showGifPicker: boolean = false
  messageToReply?: DirectMessage
  fakeInputValue: string = ''
  showUsersToMention: boolean = false
  usersToMentionFiltered: string[] = []
  inputElement = () => document.querySelector('.chat-input') as HTMLTextAreaElement

  constructor(
    private location: Location,
    private readonly _directConversationService: DirectConversationService,
    private readonly _directMessageService: DirectMessageService,
    private readonly _messageReactionsService: MessageReactionsService,
    public dialog: MatDialog,
    public readonly giphyService: GiphyService,
    private socket: Socket
  ) { }

  ngOnInit() {
    this.init()
    this.location.onUrlChange((url) => {
      if (url.includes('/directmessages')) {
        this.directMessages = []
        this.page = 1
        this.init()
      }
    })
    this._directMessageService.getNewMessage()
      .subscribe(
        (message: DirectMessage) => {
          this.directMessages.push(message)
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
  }

  init() {
    this.doNotScroll = false
    const urlObj = new URL(window.location.href)
    const params = new URLSearchParams(urlObj.search)
    if (this.page == 1 && Number(params.get('conversation')) != 0) {
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

  smoothScroll() {
    setTimeout(() => {
      this.myScrollContainer!.nativeElement.scroll({
        top: this.myScrollContainer!.nativeElement.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
  }

  scrollAfterPageFetch() {
    document.getElementsByClassName('single-message')[9]?.scrollIntoView({ behavior: 'smooth' })
  }


  onValueChange(event: Event) {
    const value = (event.target as any).value;
    this.messageValue = value;

    // USERS TO MENTION LIST
    const lastword = value.split(' ').pop()
    const usernames = [this.currentUser!.username, this.interlocutor!.username]
    if (lastword.includes('@')) {
      this.showUsersToMention = true
      if (lastword.length > 1)
        this.usersToMentionFiltered = usernames.filter(x => x.includes(lastword.slice(1)))
      else
        this.usersToMentionFiltered = usernames
    } else {
      this.showUsersToMention = false
    }

    // HIGHLIGHTING MENTIONS
    const regex = /@([a-zA-Z0-9_-]+)/g
    let match: any
    let startIndex = 0
    let highlightedText = ''
    while ((match = regex.exec(value)) !== null) {
      for (let i = 0; i < usernames.length; i++) {
        if (match[0].slice(1) == usernames[i]) {
          highlightedText += value.substring(startIndex, match.index) +
                              `<span class="mention-highlight-input">${match[0]}</span>`
          startIndex = regex.lastIndex
        }       
      }
    }
    highlightedText += value.substring(startIndex)
    this.fakeInputValue = highlightedText
  }

  mentionUser(username: string) {
    const lastword = this.messageValue.split(' ').pop()

    this.messageValue = this.messageValue.slice(0, this.messageValue.length - lastword!.length) 
    this.messageValue += `@${username}`
    this.fakeInputValue = this.fakeInputValue.slice(0, this.fakeInputValue.length - lastword!.length)
    this.fakeInputValue += `<span class="mention-highlight-input">@${username}</span>`

    this.showUsersToMention = false
    this.inputElement().focus()
  }

  fetchDirectConversation(conversationId: number) {
    this._directConversationService.getDirectConversationById(conversationId)
      .subscribe(
        (data: HttpResponse<DirectConversation>) => {
          this.directConversation = data.body!
          this.interlocutor = 
          data.body!.users[0].id == this.currentUser!.id ? 
          data.body!.users[1] : 
          data.body!.users[0] 
        },
        (error) => {
          console.log('err')
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

  onSubmit(event?: Event) {
    if (this.messageValue != '') {
      const reqBody: CreateDirectMessageParams = {
        content: this.messageToReply ? 
        `<!replyToDirectMessage:${this.messageToReply.id}%!> ${this.messageValue}`
        : this.messageValue
      }
      this._directMessageService.sendMessage(
        this.directConversation!.id, 
        this.currentUser!.id,
        reqBody
      )
      this.messageValue = '';
      var element = this.inputElement()
      setTimeout(() => {
        element.value = ''
      }, 0)
      this.messageToReply = undefined
      this.smoothScroll()
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
    this.martToggle = false
    this.showGifPicker = false
    this.showEmojiPicker = !this.showEmojiPicker
    setTimeout(() => {
      this.martToggle = true
    }, 500)
  }

  closeEmojiPicker(event: Event) {
    if (this.martToggle) {
      this.showEmojiPicker = false
      this.martToggle = false
    }
  }

  addEmojiToMessage(event: Event) {
    this.messageValue += (event as any).emoji.native
    this.fakeInputValue += (event as any).emoji.native
    this.showEmojiPicker = false
    this.inputElement().focus()
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

  toggleGifPicker() {
    this.martToggle = false
    this.showEmojiPicker = false
    this.showGifPicker = !this.showGifPicker
    setTimeout(() => {
      this.martToggle = true
    }, 500)
    this.giphyService.search('meme')
  }

  closeGifPicker(event: Event) {
    if (this.martToggle) {
      this.showGifPicker = false
      this.martToggle = false
      this.searchTerm = ''
    }
  }

  search(event?: Event) {
    this.giphyService.search(this.searchTerm)
  }

  onGifMartScroll() {
    this.giphyService.next()
  }

  sendGif(gif: any) {
    const gifUrl = gif.original.url
    this.messageValue = gifUrl
    this.onSubmit()
    this.showGifPicker = false
    this.martToggle = false
  }

  onReply(message: DirectMessage) {
    this.messageToReply = message
    this.inputElement().focus()
  }

  cancelReply() {
    this.messageToReply = undefined
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
