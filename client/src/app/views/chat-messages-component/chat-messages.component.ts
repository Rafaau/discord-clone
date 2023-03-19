import { animate, style, transition, trigger } from '@angular/animations';
import { Location, ViewportScroller } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { ChatChannel } from 'src/app/_models/chat-channels';
import { ChatMessage, CreateChatMessageParams, UpdateChatMessageParams } from 'src/app/_models/chat-message';
import { CreateMessageReactionParams, MessageReaction } from 'src/app/_models/message-reaction';
import { User } from 'src/app/_models/Users';
import { ChatChannelService } from 'src/app/_services/chat-channel.service';
import { ChatMessagesService } from 'src/app/_services/chat-messages.service';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { MessageReactionsService } from 'src/app/_services/message-reactions.service';
import { UsersService } from 'src/app/_services/users.service';
import { ConfirmDeleteDialog } from './confirm-delete-dialog/confirm-delete-dialog.component';

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
  detailsMode: number = 0
  detailsToggle: number = 0
  currentMemberOptions: number = 0
  showEmojiPicker: boolean = false
  martToggle: number = 0
  page: number = 1
  loading: boolean = false
  showReactionsPicker: boolean = false
  reactionsMartToggle: number = 0
  messageToReact: number = 0
  reactionsGrouped: boolean = false
  groupToIncrement = [0, '']

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private readonly _chatMessagesService: ChatMessagesService,
    private readonly _chatChannelsService: ChatChannelService,
    private readonly _usersService: UsersService,
    private readonly _chatServerService: ChatServerService,
    private readonly _messageReactionsService: MessageReactionsService,
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
    this._messageReactionsService.getNewMessageReaction()
        .subscribe(
          (reaction: MessageReaction) => {
            this.chatMessages.filter(x => x.id == reaction.chatMessage!.id)[0].reactions!.push(reaction)
          }
        )
      this._messageReactionsService.getDeletedReaction()
        .subscribe(
          (data: any) => {
            this.chatMessages.filter(x => x.id == data[1])[0].reactions =
              this.chatMessages.filter(x => x.id == data[1])[0].reactions!.filter(x => x.id != data[0])
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

  addOrRemoveReaction(messageId: number, reactionGroup: any) {
    this.groupToIncrement = reactionGroup.reaction
    if (this.isReactedByCurrentUser(reactionGroup.users)) {
      this.groupToIncrement = [0, reactionGroup.reaction]
      const reaction = reactionGroup.objects.filter((x: { user: { id: number; }; }) => x.user.id == this.currentUser!.id)[0] // 22 23
      this._messageReactionsService
        .deleteMessageReaction(reaction.id, reaction.chatMessage!.id)
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