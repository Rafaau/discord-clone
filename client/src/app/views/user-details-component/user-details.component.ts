import { animate, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CreateDirectConversationParams, DirectConversation } from 'src/app/_models/direct-conversation';
import { CreateDirectMessageParams } from 'src/app/_models/direct-message';
import { Role } from 'src/app/_models/role';
import { User, UserComplex } from 'src/app/_models/user';
import { DirectConversationService } from 'src/app/_services/direct-conversation.service';
import { DirectMessageService } from 'src/app/_services/direct-message.service';
import { CacheResolverService } from 'src/app/utils/CacheResolver.service';
import { environment } from 'src/environments/environment';

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
export class UserDetailsComponent implements OnInit, OnDestroy {
  @Input()
  currentUser?: User
  @Input()
  user?: User | UserComplex
  @Input()
  isMobile?: boolean
  messageValue: string = ''
  @Input()
  centered?: boolean
  onDestroy$ = new Subject<void>()

  constructor(
    private router: Router,
    private location: Location,
    private readonly _directConversationService: DirectConversationService,
    private readonly _directMessageService: DirectMessageService,
    private readonly _cacheResolver: CacheResolverService
  ) { }

  ngOnInit() {
    this._directConversationService.getNewConversation()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (conversation: DirectConversation) => {
          conversation.users.sort((a, b) => {
            if (a.id === this.currentUser!.id) return -1
            if (b.id === this.currentUser!.id) return 1
            return 0
          })
          const messageReqBody: CreateDirectMessageParams = {
            content: this.messageValue
          }
          // DIRECT CONVERSATIONS CACHE
          const key = environment.apiUrl + `/directconversations/user/${this.currentUser!.id}`
          const cachedResponse = this._cacheResolver.get(key)

          if (cachedResponse) {
            const updatedData = [...cachedResponse.body, conversation]
            const updatedResponse = cachedResponse.clone({ body: updatedData })
            this._cacheResolver.set(key, updatedResponse)
          }

          this._directMessageService.createDirectMessage(
            conversation.id,
            this.currentUser!.id,
            messageReqBody
          ).subscribe((data: HttpResponse<{}>) => {
              this.router.navigate([{ outlets: { main: ['conversation', conversation.id ], secondary: ['directmessages'] } }])
            }
          )
        })
  }

  ngOnDestroy() {
    this.onDestroy$.next()
    this.onDestroy$.complete()
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
    }
  }

  onValueChange(event: Event) {
    const value = (event.target as any).value
    this.messageValue = value
  }
}
