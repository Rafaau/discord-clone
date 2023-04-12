import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { groupBy } from 'lodash';
import { Socket } from 'ngx-socket-io';
import { Subject, takeUntil } from 'rxjs';
import { ChatMessage } from 'src/app/_models/chat-message';
import { DirectMessage } from 'src/app/_models/direct-message';
import { CreateMessageReactionParams, MessageReaction } from 'src/app/_models/message-reaction';
import { User } from 'src/app/_models/user';
import { MessageReactionsService } from 'src/app/_services/message-reactions.service';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';

@Component({
  selector: 'message-reactions',
  templateUrl: './message-reactions.component.html',
  styleUrls: ['./message-reactions.component.css']
})
export class MessageReactionsComponent implements OnInit, OnDestroy {
  @Input()
  message?: ChatMessage | DirectMessage
  lastMessage?: ChatMessage
  @Input()
  currentUser?: User
  reactionGroups: any[] = []
  groupToIncrement = [0, '']
  counter: number = 0
  onDestroy$ = new Subject<void>()

  constructor(
    private readonly _messageReactionsService: MessageReactionsService,
    private readonly _sharedDataProvider: SharedDataProvider,
    private readonly socket: Socket
  ) { }

  ngOnInit() {
    // RETRIEVE CACHED REACTIONS
    const cachedReactions = this._sharedDataProvider.getCachedMessageReactions(this.message!.id)
    cachedReactions.forEach((reaction: MessageReaction) => {
      if (!this.message!.reactions?.some(x => x.id == reaction.id)) {
        this.message!.reactions!.push(reaction)
      }
    })
    // RETRIEVE DELETED REACTIONS
    const deletedReactions = this._sharedDataProvider.getDeletedMessageReactions(this.message!.id)
    for (const reactionId of deletedReactions) {
      const index = this.message!.reactions?.findIndex(x => x.id == reactionId)
      if (index != -1) {
        this.message!.reactions?.splice(index!, 1)
        this._sharedDataProvider.clearDeletedMessageReaction(this.message!.id)
      }
    }   
    this._sharedDataProvider.clearCachedMessageReactions(this.message!.id)
    this.reactionGroups = this.getReactionGroups(this.message!.reactions!)
    this._messageReactionsService.getNewMessageReaction()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (reaction: MessageReaction) => {
          if (reaction.chatMessage?.id == this.message!.id
          || reaction.directMessage?.id == this.message!.id ) {
            this.message!.reactions!.push(reaction)
            this.reactionGroups = this.getReactionGroups(this.message!.reactions!)
          }
        }
      )
    this._messageReactionsService.getDeletedReaction()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (data: any) => {
          if (this.message!.id == data[1]) {
            this.message!.reactions = this.message!.reactions!
              .filter(x => x.id != data[0])
            this.reactionGroups = this.getReactionGroups(this.message!.reactions!)
          }
        }
      )
  }

  ngOnDestroy() {
    this.onDestroy$.next()
    this.onDestroy$.complete()
  }

  getReactionGroups(reactions: MessageReaction[]) {
    const reactionGroups = Object.values(groupBy(reactions, 'reaction'))
      .map((group: any) => {
        return {
          reaction: group[0].reaction,
          count: group.length,
          users: group.map((reaction: { user: any; }) => reaction.user),
          objects: group.map((reaction: any) => reaction)
        }
      })

      return reactionGroups
  }

  trackByReactionGroupIndex(index: number, item: { reaction: string, count: number, users: any, objects: any }): number {
    return index;
  }

  isReactedByCurrentUser(users: User[]) {
    return users.some(x => x.id == this.currentUser?.id)
  }

  addOrRemoveReaction(messageId: number, reactionGroup: any) {
    this.groupToIncrement = reactionGroup.reaction
    if (this.isReactedByCurrentUser(reactionGroup.users)) {
      this.groupToIncrement = [0, reactionGroup.reaction]
      const reaction = reactionGroup.objects.filter((x: { user: { id: number; }; }) => x.user.id == this.currentUser!.id)[0] // 22 23
      this._messageReactionsService
        .deleteMessageReaction(reaction.id, reaction.chatMessage ? 
          reaction.chatMessage!.id : reaction.directMessage!.id)
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
    this.lastMessage = null!
  }

  sendReaction(messageId: number, event: Event) {
    const reqBody: CreateMessageReactionParams = {
      reaction: (event as any).emoji.native
    }
    this._messageReactionsService.sendMessageReaction(
      reqBody,
      this.currentUser!.id,
      (this.message as any).chatChannel ? messageId : undefined,
      (this.message as any).directConversation ? messageId : undefined,
    )
  } 
}
