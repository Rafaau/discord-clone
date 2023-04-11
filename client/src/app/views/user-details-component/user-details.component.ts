import { animate, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateDirectConversationParams } from 'src/app/_models/direct-conversation';
import { CreateDirectMessageParams } from 'src/app/_models/direct-message';
import { Role } from 'src/app/_models/role';
import { User, UserComplex } from 'src/app/_models/user';
import { DirectConversationService } from 'src/app/_services/direct-conversation.service';
import { DirectMessageService } from 'src/app/_services/direct-message.service';

@Component({
  selector: 'user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(-10px)'
        }),
        animate('0.1s ease-in', 
          style({
            opacity: 1,
            transform: 'translateX(*)'
        }))
      ])
    ])
  ]
})
export class UserDetailsComponent implements OnInit {
  @Input()
  currentUser?: User
  @Input()
  user?: User | UserComplex
  messageValue: string = ''
  @Input()
  centered?: boolean

  constructor(
    private router: Router,
    private location: Location,
    private readonly _directConversationService: DirectConversationService,
    private readonly _directMessageService: DirectMessageService
  ) { }

  ngOnInit() {
  }

  onSubmit(event: Event) {
    const messageReqBody: CreateDirectMessageParams = {
      content: this.messageValue
    }
    const conversation = (this.user as UserComplex).directConversations
      .find(conversation => conversation.users.some(user => user.id === this.currentUser!.id))
    if (conversation != undefined) {
      const conversationId = conversation.id
      this._directMessageService.createDirectMessage(
        conversationId, 
        this.currentUser!.id,
        messageReqBody
      ).subscribe(
        (data: HttpResponse<{}>) => {
          this.router.navigate([{ outlets: { main: ['conversation', conversationId], secondary: ['directmessages'] } }])
        }
      )
    } else {
      const reqBody: CreateDirectConversationParams = {
        users: [this.user!, this.currentUser!]
      }
      this._directConversationService.createDirectConversation(reqBody)
        .subscribe(
          (conversationData: HttpResponse<any>) => {
            this._directMessageService.createDirectMessage(
              conversationData.body!.id,
              this.currentUser!.id,
              messageReqBody
            ).subscribe(
              (data: HttpResponse<{}>) => {
                this.router.navigate([{ outlets: { main: ['conversation', conversationData.body!.id ], secondary: ['directmessages'] } }])
              }
            )           
          }
        )
    }
  }

  onValueChange(event: Event) {
    const value = (event.target as any).value
    this.messageValue = value
  }
}
