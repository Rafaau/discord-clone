import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { indexOf } from 'lodash';
import { ChatMessage } from 'src/app/_models/chat-message';
import { ChatServerInvitation } from 'src/app/_models/chat-server-invitation';
import { ChatServer } from 'src/app/_models/chat-servers';
import { User } from 'src/app/_models/user';
import { ChatMessagesService } from 'src/app/_services/chat-messages.service';
import { ChatServerInvitationService } from 'src/app/_services/chat-server-invitation.service';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { DirectMessageService } from 'src/app/_services/direct-message.service';

@Component({
  selector: 'message-content',
  templateUrl: './message-content.component.html',
  styleUrls: ['./message-content.component.css'],
  providers: [{ provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: { showDelay: 1000 } }]
})
export class MessageContentComponent implements OnInit {
  @Input()
  messageContent: string = ''
  @Input()
  currentUser?: User
  @Input()
  usernames: string[] = []
  @Output()
  onJoinCallback = new EventEmitter()
  chatServer?: ChatServer
  isAlreadyMember: boolean = false
  isExpired: boolean = false
  isLoading: boolean = false
  player?: YT.Player
  videoId: string = ''
  videoTitle: string = ''
  videoChannel: string = ''
  giphyUrl: string = ''
  isImage: boolean = false
  messageToReply?: ChatMessage
  replied: string = ''

  constructor(
    private readonly _chatServerService: ChatServerService,
    private readonly _invitationService: ChatServerInvitationService,
    private readonly _chatMessageService: ChatMessagesService,
    private readonly _directMessageService: DirectMessageService,
    private router: Router,
  ) { }

  ngOnInit() {
    if (this.messageContent.includes('http://localhost:4200/invitation?v='))
      this.getInvitationParams()
    else if (this.messageContent.includes('https://www.youtube.com/watch?'))
      this.getVideoIdFromLink()
    else if (this.messageContent.includes('<!replyTo'))
      this.getReplyDetails()
    else
      this.checkMentions()
  }

  checkMentions() {
    // HIGHLIGHTING MENTIONS
    const regex = /@([a-zA-Z0-9_-]+)/g
    let match: any
    let startIndex = 0
    let highlightedText = ''
    while ((match = regex.exec(this.messageContent)) !== null) {
      this.usernames!.forEach(x => {
        if (match[0].slice(1) == x) {
          highlightedText += this.messageContent.substring(startIndex, match.index) +
                              `<span class="mention-highlight">${match[0]}</span>`
          startIndex = regex.lastIndex
        }
      })
    }
    highlightedText += this.messageContent.substring(startIndex)
    this.messageContent = highlightedText
  }

  getReplyDetails() {
    const messageId = this.messageContent.slice(
      indexOf(this.messageContent, ':') + 1,
      indexOf(this.messageContent, '%')
    )
    if (this.messageContent.includes('ChatMessage')) {
      this._chatMessageService.getSingleMessage(Number(messageId))
        .subscribe(
          (data: HttpResponse<ChatMessage>) => {
            this.messageToReply = data.body!
          },
          (error) => {
            console.log('err')
          }
        )
    } else if (this.messageContent.includes('DirectMessage')) {
      this._directMessageService.getSingleMessage(Number(messageId))
        .subscribe(
          (data: HttpResponse<ChatMessage>) => {
            this.messageToReply = data.body!
          },
          (error) => {
            console.log('err')
          }
        )
    }
      this.replied = this.messageContent.slice(
        indexOf(this.messageContent, '>') + 1
      )
  }

  getInvitationParams() {
    const urlObj = new URL(this.messageContent)
    const params = new URLSearchParams(urlObj.search)
    const uuid = params.get('v')!
    this._invitationService.getInvitationByUuid(uuid)
      .subscribe(
        (invData: HttpResponse<ChatServerInvitation>) => {
          this._chatServerService.getChatServerById(invData.body!.chatServer.id)
          .subscribe(
            (data: HttpResponse<ChatServer>) => {
              this.chatServer = data.body!
              this.isAlreadyMember = data.body!.members!.some(x => x.id == this.currentUser?.id)
            },
            (error) => {
              console.log('err')
            }
          )
          this.isExpired = new Date(invData.body!.expirationTime) < new Date()
        },
        (error) => {
          console.log('err')
        }
      )
  }

  handleJoinChatServer() {
    if (!this.isAlreadyMember) {
      this._chatServerService.addUserToChatServer(this.chatServer!.id, this.currentUser!.id)
        .subscribe(
          (data: HttpResponse<any>) => {
            this.isLoading = true
            setTimeout(() => {
              this.onJoinCallback.emit()
              this.router.navigate([{ outlets: { main: null, secondary: ['chatserver', this.chatServer!.id] } }])
            }, 1000)
          },
          (error) => {
            console.log('err')
          }
        )
    }
  }

  getVideoIdFromLink() {
    const urlObj = new URL(this.messageContent)
    const params = new URLSearchParams(urlObj.search)
    this.videoId = params.get('v')!
    this.videoChannel = params.get('ab_channel')!
  }

  savePlayer(player: YT.Player) {
    this.player = player
    this.videoTitle = (player as any).videoTitle
  }

  onStateChange(event: YT.PlayerEvent) {

  }

  isNotImage() {
    this.isImage = false
  }
}
