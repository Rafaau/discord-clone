import { Component, DoCheck, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { groupBy } from 'lodash';
import { Socket } from 'ngx-socket-io';
import { ChatMessage } from 'src/app/_models/chat-message';
import { DirectMessage } from 'src/app/_models/direct-message';
import { CreateMessageReactionParams, MessageReaction } from 'src/app/_models/message-reaction';
import { User } from 'src/app/_models/Users';
import { MessageReactionsService } from 'src/app/_services/message-reactions.service';

@Component({
  selector: 'message-reactions',
  templateUrl: './message-reactions.component.html',
  styleUrls: ['./message-reactions.component.css']
})
export class MessageReactionsComponent implements OnInit {
  @Input()
  message?: ChatMessage | DirectMessage
  lastMessage?: ChatMessage
  @Input()
  currentUser?: User
  reactionGroups: any[] = []
  groupToIncrement = [0, '']
  counter: number = 0

  constructor(
    private readonly _messageReactionsService: MessageReactionsService,
    private readonly socket: Socket
  ) { }

  ngOnInit() {
    this.reactionGroups = this.getReactionGroups(this.message!.reactions!)
    this._messageReactionsService.getNewMessageReaction()
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
