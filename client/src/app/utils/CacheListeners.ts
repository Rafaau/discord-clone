import { ChatMessagesService } from "../_services/chat-messages.service"
import { SharedDataProvider } from "./SharedDataProvider.service"
import { Router } from "@angular/router"
import { ChatMessage } from "../_models/chat-message"
import { Subject, takeUntil } from "rxjs"
import { MessageReactionsService } from "../_services/message-reactions.service"
import { DirectMessageService } from "../_services/direct-message.service"
import { MessageReaction } from "../_models/message-reaction"
import { DirectMessage } from "../_models/direct-message"

export function initListeners(
    onDestroy$: Subject<void>,
    _chatMessagesService: ChatMessagesService,
    _sharedDataProvider: SharedDataProvider,
    _messageReactionsService: MessageReactionsService,
    _directMessagesService: DirectMessageService,
    router: Router
) {
    _chatMessagesService.getNewMessage()
    .pipe(takeUntil(onDestroy$))
    .subscribe((message: ChatMessage) => {
      if (!router.url.includes(`channel/${message.chatChannel.id}/`)) {
        _sharedDataProvider.addToCachedChatMessages(message)
      }
    })
  _chatMessagesService.getDeletedMessage()
    .pipe(takeUntil(onDestroy$))
    .subscribe((messageId: number) => {
      _sharedDataProvider.addDeletedMessageId(messageId)
    })
  _chatMessagesService.getEditedMessage()
    .pipe(takeUntil(onDestroy$))
    .subscribe((message: ChatMessage) => {
      if (!router.url.includes(`channel/${message.chatChannel.id}/`)) {
        _sharedDataProvider.addToCachedUpdatedChatMessages(message)
      }
    })
  _messageReactionsService.getNewMessageReaction()
    .pipe(takeUntil(onDestroy$))
    .subscribe((messageReaction: MessageReaction) => {
      _sharedDataProvider.addToCachedMessageReactions(messageReaction)
    })
  _messageReactionsService.getDeletedReaction()
    .pipe(takeUntil(onDestroy$))
    .subscribe((data: any) => {
      _sharedDataProvider.addDeletedMessageReaction(data[1], data[0])
    })
  _directMessagesService.getNewMessage()
    .pipe(takeUntil(onDestroy$))
    .subscribe((message: DirectMessage) => {
      if (!router.url.includes(`conversation/${message.directConversation.id}/`))
        _sharedDataProvider.addToCachedDirectMessages(message)
    })
  _directMessagesService.getEditedMessage()
    .pipe(takeUntil(onDestroy$))
    .subscribe((message: DirectMessage) => {
      if (!router.url.includes(`conversation/${message.directConversation.id}/`))
        _sharedDataProvider.addToCachedUpdatedDirectMessages(message)
    })
  _directMessagesService.getDeletedMessage()
    .pipe(takeUntil(onDestroy$))
    .subscribe((messageId: number) => {
      _sharedDataProvider.addDeletedDirectMessageId(messageId)
    })   
}