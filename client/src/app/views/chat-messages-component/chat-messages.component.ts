import { animate, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { ChatChannel } from 'src/app/_models/chat-channels';
import { ChatMessage, CreateChatMessageParams, UpdateChatMessageParams } from 'src/app/_models/chat-message';
import { CreateMessageReactionParams } from 'src/app/_models/message-reaction';
import { User } from 'src/app/_models/user';
import { ChatChannelService } from 'src/app/_services/chat-channel.service';
import { ChatMessagesService } from 'src/app/_services/chat-messages.service';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { MessageReactionsService } from 'src/app/_services/message-reactions.service';
import { ConfirmDeleteDialog } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { GiphyService } from 'src/app/_services/giphy.service';
import { CreateNotificationParams, Notification } from 'src/app/_models/notification';
import { NotificationsService } from 'src/app/_services/notifications.service';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';
import { UsersService } from 'src/app/_services/users.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: [
    './chat-messages.component.css',
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
export class ChatMessagesComponent implements OnInit, OnDestroy {
  members?: User[] = []
  currentUser?: User
  @Output()
  onJoinCallback = new EventEmitter()
  @ViewChild('wrapper') myScrollContainer?: ElementRef
  currentRoute = new LocationHrefProvider(this.location)
  chatMessages: ChatMessage[] = []
  chatChannel?: ChatChannel
  showMembers: boolean = true
  messageValue: string = ''
  doNotScroll: boolean = false
  messageToEditId: number = 0
  messageToEditValue: string = ''
  currentMemberDetails: number = 0
  detailsMode: number = 0
  detailsToggle: number = 0
  currentMemberOptions: number = 0
  showEmojiPicker: boolean = false
  martToggle: boolean = false
  page: number = 1
  loading: boolean = false
  showReactionsPicker: boolean = false
  reactionsMartToggle: number = 0
  messageToReact: number = 0
  showGifPicker: boolean = false
  searchTerm: string = ''
  messageToReply?: ChatMessage
  fakeInputValue: string = ''
  usernames: string[] = []
  showUsersToMention: boolean = false
  usersToMentionFiltered: User[] = []
  usersToNotify: number[] = []
  inputElement = () => document.querySelector('.chat-input') as HTMLTextAreaElement
  onDestroy$ = new Subject<void>()

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private readonly _chatMessagesService: ChatMessagesService,
    private readonly _chatChannelsService: ChatChannelService,
    public readonly _giphyService: GiphyService,
    private readonly _chatServerService: ChatServerService,
    private readonly _messageReactionsService: MessageReactionsService,
    private readonly _notificationsService: NotificationsService,
    private readonly _sharedDatatProvider: SharedDataProvider,
    private readonly _usersService: UsersService,
    public dialog: MatDialog,
    private socket: Socket
  ) { }

  ngOnInit() {
    this.init()
    this.route.params.subscribe(params => {
      this.chatMessages = []
      this.page = 1
      this.messageToReact = 0
      this.messageToReply = undefined
      this.messageToEditId = 0
      this.init()
    })
    this._chatMessagesService.getNewMessage()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (message: ChatMessage) => {
          if (message.chatChannel.id == this.chatChannel!.id) {
            this.chatMessages.push(message)
            this.smoothScroll()
          }
        }
      )
    this._chatMessagesService.getEditedMessage()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (message: ChatMessage) => {
          this.chatMessages.filter(x => x.id == message.id)[0].content = message.content
        }
      )
    this._chatMessagesService.getDeletedMessage()
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(
          (messageId: number) => {
            this.chatMessages = this.chatMessages.filter(x => x.id != messageId)
          }
        )
  }

  ngOnDestroy() {
    this.onDestroy$.next()
    this.onDestroy$.complete()
  }

  init() {
    this.doNotScroll = false
    this.getCurrentUser()
    this.getMembers()
    const channelId = this.route.snapshot.paramMap.get('channelId')
    if (this.page == 1 && Number(channelId)) {
      this.fetchChatMessages(Number(channelId))
      this.getChatChannel(Number(channelId))
    }
    setTimeout(() => {
      this.doNotScroll = true // to avoid scrolling on tooltip display
    }, 500)
  }

  getCurrentUser() {
    this._sharedDatatProvider.getCurrentUser().subscribe(
      (user: User) => {
        this.currentUser = user
      })
  }

  getMembers() {
    this._sharedDatatProvider.getMembers().subscribe(
      (members: User[]) => {
        console.log('members fetched')
        this.members = members

        if (!this.usernames.length)
          members?.forEach(x => {
            this.usernames.push(x.username)
          })
      })
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

  onValueChange(event: any) {
    const value = (event.target as any).value
    this.messageValue = value

    // USERS TO MENTION LIST
    const lastword = value.split(' ').pop()
    if (lastword.includes('@')) {
      this.showUsersToMention = true
      if (lastword.length > 1)
        this.usersToMentionFiltered = this.members!.filter(x => x.username.includes(lastword.slice(1)))
      else
        this.usersToMentionFiltered = this.members!
    } else {
      this.showUsersToMention = false
    }

    // HIGHLIGHTING MENTIONS
    const regex = /@([a-zA-Z0-9_-]+)/g
    let match: any
    let startIndex = 0
    let highlightedText = ''
    while ((match = regex.exec(value)) !== null) {
      for (let i = 0; i < this.members!.length; i++) {
        if (match[0].slice(1) == this.members![i].username) {
          if (!this.usersToNotify.includes(this.members![i].id))
          {
            this.usersToNotify.push(this.members![i].id)
          }  
          highlightedText += value.substring(startIndex, match.index) +
                             `<span class="mention-highlight-input">${match[0]}</span>`
          startIndex = regex.lastIndex
        } else {
          setTimeout(() => this.usersToNotify = [], 1000) // TO 
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

    const fakeEvent = {
      target: {
        value: this.messageValue
      }
    }
    this.onValueChange(fakeEvent)
    
    this.showUsersToMention = false
    this.inputElement().focus()
  }

  onSubmit(event?: Event) {
    if (this.messageValue != '') {
      const reqBody: CreateChatMessageParams = {
        content: this.messageToReply ? 
        `<!replyToChatMessage:${this.messageToReply.id}%!> ${this.messageValue}`
        : this.messageValue
      }
      this._chatMessagesService.sendMessage(
        this.chatChannel!.id,
        this.currentUser!.id,
        reqBody
      )
      this.messageValue = ''
      var element = this.inputElement()
      setTimeout(() => {
        element.value = ''
      }, 0)

      if (this.usersToNotify.length) {
        this.usersToNotify.forEach(x => {
          this.sendNotification(
            x, 
            `You have been mentioned in ${this.chatChannel!.name} by ${this.currentUser!.username}`
          )
        })
      }

      if (this.messageToReply) {
        this.sendNotification(
          this.messageToReply.user.id,
          `${this.currentUser!.username} has replied to your message.`
        )
      }

      this.messageToReply = undefined
      this.usersToNotify = []
      this.smoothScroll()
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
  }

  openMemberDetails(userId: number, mode: number) {
    this.currentMemberDetails = userId
    this.detailsMode = mode
    this.detailsToggle = 0
  }

  closeMemberDetails(event: Event) {
    setTimeout(() => {
      this.detailsToggle = 1
    }, 100)
    if (this.detailsToggle == 1){
      this.currentMemberDetails = 0
      this.detailsToggle = 0
    }  
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

  onMemberRightClick(userId: number) {
    if (this.currentUser!.id == this.members!.filter(x => x.isOwner == true)[0].id) {
      this.currentMemberOptions = userId
      return false
    }
      return true
  }

  onKickMember(userId: number) {
    this._chatServerService.removeMemberFromChatServer(this.chatChannel!.chatCategory.chatServer!.id, userId)
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
    this._giphyService.search('meme')
  }

  closeGifPicker(event: Event) {
    if (this.martToggle) {
      this.showGifPicker = false
      this.martToggle = false
      this.searchTerm = ''
    }
  }

  search(event?: Event) {
    this._giphyService.search(this.searchTerm)
  }

  onGifMartScroll() {
    this._giphyService.next()
  }

  sendGif(gif: any) {
    const gifUrl = gif.original.url
    this.messageValue = gifUrl
    this.onSubmit()
    this.showGifPicker = false
    this.martToggle = false
  }

  onReply(message: ChatMessage) {
    this.messageToReply = message
    this.inputElement().focus()
    this.smoothScroll()
  }

  cancelReply() {
    this.messageToReply = undefined
  }

  sendNotification(userId: number, message: string) {
    const reqBody: CreateNotificationParams = {
      message: message,
      source: `ChatServer=${this.chatChannel!.chatCategory.chatServer.id},Channel=${this.chatChannel!.id}`
    }
    this._notificationsService.createNotification(userId, reqBody)
  }

  onScroll() {
    if (!this.loading && !this.orderByPostDate(this.chatMessages)[0].isFirst) {
      this.loading = true
      this.currentMemberDetails = 0
      this.detailsToggle = 0
      setTimeout(() => {
        this.page++
        this.fetchChatMessages(this.chatChannel!.id)
        this.loading = false
        this.scrollAfterPageFetch()
      }, 1000)
    }
  }

  isPermittedToSendMessages() {
    if (this.currentUser) {
      const currentChatServerId = this.chatChannel!.chatCategory.chatServer.id
      const userRolesForCurrentServer = this.currentUser!.roles!.filter(role => role.chatServer.id === currentChatServerId)
    
      return userRolesForCurrentServer.some(role => {
        return role.permissions.some(permission => permission['send-messages'] === true)
      })
    } else return false
  }

  isPermittedToKickMembers() {
    const currentChatServerId = this.chatChannel!.chatCategory.chatServer.id
    const userRolesForCurrentServer = this.currentUser!.roles!.filter(role => role.chatServer.id === currentChatServerId)
  
    return userRolesForCurrentServer.some(role => {
      return role.permissions.some(permission => permission['administrator'] === true)
    })
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