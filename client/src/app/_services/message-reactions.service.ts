import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { ChatMessage } from '../_models/chat-message';
import { DirectMessage } from '../_models/direct-message';
import { CreateMessageReactionParams, MessageReaction } from '../_models/message-reaction';

@Injectable({
  providedIn: 'root'
})
export class MessageReactionsService {

  constructor(
    private readonly socket: Socket
  ) { }

  sendMessageReaction(
    reactionParams: CreateMessageReactionParams,
    userId: number,
    chatMessageId?: number,
    directMessageId?: number
  ) {
    this.socket.emit(
      'sendReaction',
      reactionParams,
      userId,
      chatMessageId,
      directMessageId
    )
  }

  getNewMessageReaction(): Observable<any> {
    return this.socket.fromEvent<MessageReaction>('newMessageReaction')
  }

  deleteMessageReaction(id: number, messageId: number) {
    this.socket.emit('deleteReaction', id, messageId)
  }

  getDeletedReaction(): Observable<any> {
    return this.socket.fromEvent<any>('deletedReaction')
  }
}
