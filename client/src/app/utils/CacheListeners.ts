import { ChatMessagesService } from "../_services/chat-messages.service"
import { SharedDataProvider } from "./SharedDataProvider.service"
import { Router } from "@angular/router"
import { ChatMessage } from "../_models/chat-message"
import { Subject, takeUntil } from "rxjs"
import { MessageReactionsService } from "../_services/message-reactions.service"
import { DirectMessageService } from "../_services/direct-message.service"
import { MessageReaction } from "../_models/message-reaction"
import { DirectMessage } from "../_models/direct-message"
import { ChatChannelService } from "../_services/chat-channel.service"
import { environment } from "src/environments/environment"
import { ChatCategory } from "../_models/chat-category"
import { CacheResolverService } from "./CacheResolver.service"
import { ChatChannel } from "../_models/chat-channels"
import { ChatServerService } from "../_services/chat-server.service"
import { ChatServer } from "../_models/chat-servers"
import { User } from "../_models/user"

export function initListeners(
    onDestroy$: Subject<void>,
    _chatMessagesService: ChatMessagesService,
    _sharedDataProvider: SharedDataProvider,
    _messageReactionsService: MessageReactionsService,
    _directMessagesService: DirectMessageService,
    _chatChannelService: ChatChannelService,
    _chatServerService: ChatServerService,
    cacheResolver: CacheResolverService,
    router: Router
) {
    _chatMessagesService.getNewMessage()
      .pipe(takeUntil(onDestroy$))
      .subscribe((message: ChatMessage) => {
        if (router.url.includes(`channel/${message.chatChannel.id}/`)) return

        const key = environment.apiUrl + `/chatmessages?filterByChannel=${message.chatChannel.id}&page=1`
        const cachedResponse = cacheResolver.get(key)

        if (cachedResponse) {
          const updatedData = [...cachedResponse.body, message]
          const updatedResponse = cachedResponse.clone({ body: updatedData })
          cacheResolver.set(key, updatedResponse)
        }
      })
  _chatMessagesService.getDeletedMessage()
    .pipe(takeUntil(onDestroy$))
    .subscribe((message: ChatMessage) => {
      const key = environment.apiUrl + `/chatmessages?filterByChannel=${message.chatChannel.id}&page=1`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedData = cachedResponse.body.filter((m: ChatMessage) => m.id != message.id)
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })
  _chatMessagesService.getEditedMessage()
    .pipe(takeUntil(onDestroy$))
    .subscribe((message: ChatMessage) => {
      if (router.url.includes(`channel/${message.chatChannel.id}/`)) return

      const key = environment.apiUrl + `/chatmessages?filterByChannel=${message.chatChannel.id}&page=1`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedData = cachedResponse.body.map((m: ChatMessage) => m.id == message.id ? message : m)
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })
  _messageReactionsService.getNewMessageReaction()
    .pipe(takeUntil(onDestroy$))
    .subscribe((messageReaction: MessageReaction) => {
      if ((messageReaction.chatMessage && router.url.includes(`channel/${messageReaction.chatMessage?.chatChannel.id}/`))
       || (messageReaction.directMessage && router.url.includes(`conversation/${messageReaction.directMessage?.directConversation.id}/`))) return

      if (messageReaction.chatMessage) {
        const key = environment.apiUrl + `/chatmessages?filterByChannel=${messageReaction.chatMessage.chatChannel.id}&page=1`
        const cachedResponse = cacheResolver.get(key)

        if (cachedResponse) {
          const updatedData = cachedResponse.body.map((message: ChatMessage) => {
            if (message.id == messageReaction.chatMessage!.id) {
              message.reactions = [...message.reactions!, messageReaction]
            }
            return message
          })
          const updatedResponse = cachedResponse.clone({ body: updatedData })
          cacheResolver.set(key, updatedResponse)
        }
      } else if (messageReaction.directMessage) {
        const key = environment.apiUrl + `/directmessages?conversation=${messageReaction.directMessage.directConversation.id}&page=1`
        const cachedResponse = cacheResolver.get(key)

        if (cachedResponse) {
          const updatedData = cachedResponse.body.map((message: DirectMessage) => {
            if (message.id == messageReaction.directMessage!.id) {
              message.reactions = [...message.reactions!, messageReaction]
            }
            return message
          })
          const updatedResponse = cachedResponse.clone({ body: updatedData })
          cacheResolver.set(key, updatedResponse)
        }
      }
    })
  _messageReactionsService.getDeletedReaction()
    .pipe(takeUntil(onDestroy$))
    .subscribe((messageReaction: MessageReaction) => {
      if ((messageReaction.chatMessage && router.url.includes(`channel/${messageReaction.chatMessage?.chatChannel.id}/`))
      || (messageReaction.directMessage && router.url.includes(`conversation/${messageReaction.directMessage?.directConversation.id}/`))) return

     if (messageReaction.chatMessage) {
       const key = environment.apiUrl + `/chatmessages?filterByChannel=${messageReaction.chatMessage.chatChannel.id}&page=1`
       const cachedResponse = cacheResolver.get(key)

       if (cachedResponse) {
         const updatedData = cachedResponse.body.map((message: ChatMessage) => {
           if (message.id == messageReaction.chatMessage!.id) {
             message.reactions = message.reactions!.filter((r: MessageReaction) => r.id != messageReaction.id)
           }
           return message
         })
         const updatedResponse = cachedResponse.clone({ body: updatedData })
         cacheResolver.set(key, updatedResponse)
       }
     } else if (messageReaction.directMessage) {
        const key = environment.apiUrl + `/directmessages?conversation=${messageReaction.directMessage.directConversation.id}&page=1`
        const cachedResponse = cacheResolver.get(key)
  
        if (cachedResponse) {
          const updatedData = cachedResponse.body.map((message: DirectMessage) => {
            if (message.id == messageReaction.directMessage!.id) {
              message.reactions = message.reactions!.filter((r: MessageReaction) => r.id != messageReaction.id)
            }
            return message
          })
          const updatedResponse = cachedResponse.clone({ body: updatedData })
          cacheResolver.set(key, updatedResponse)
        }
      }
    })
  _directMessagesService.getNewMessage()
    .pipe(takeUntil(onDestroy$))
    .subscribe((message: DirectMessage) => {
      if (router.url.includes(`conversation/${message.directConversation.id}/`)) return
      
      const key = environment.apiUrl + `/directmessages?conversation=${message.directConversation.id}&page=1`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedData = [...cachedResponse.body, message]
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })
  _directMessagesService.getEditedMessage()
    .pipe(takeUntil(onDestroy$))
    .subscribe((message: DirectMessage) => {
      if (router.url.includes(`conversation/${message.directConversation.id}/`)) return
        
      const key = environment.apiUrl + `/directmessages?conversation=${message.directConversation.id}&page=1`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedData = cachedResponse.body.map((m: DirectMessage) => m.id == message.id ? message : m)
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })
  _directMessagesService.getDeletedMessage()
    .pipe(takeUntil(onDestroy$))
    .subscribe((message: DirectMessage) => {
      const key = environment.apiUrl + `/directmessages?conversation=${message.directConversation.id}&page=1`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedData = cachedResponse.body.filter((m: DirectMessage) => m.id != message.id)
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })   
  _chatChannelService.getCreatedCategory()
    .pipe(takeUntil(onDestroy$))
    .subscribe((category: ChatCategory) => {
      if (router.url.includes(`chatserver/${category.chatServer.id}`)) return
      
      const key = environment.apiUrl + `/chatservers/${category.chatServer.id}`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedData = { chatCategories: [...cachedResponse.body.chatCategories, category] }
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })
  _chatChannelService.getCreatedChannel()
    .pipe(takeUntil(onDestroy$))
    .subscribe((channel: ChatChannel) => {
      if (router.url.includes(`chatserver/${channel.chatCategory.chatServer.id}`)) return
      
      const key = environment.apiUrl + `/chatservers/${channel.chatCategory.chatServer.id}`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedData = {
          chatCategories: [
            ...cachedResponse.body.chatCategories.map((category: ChatCategory) => {
              if (category.id === channel.chatCategory.id) {
                return { ...category, chatChannels: [...category.chatChannels, channel] }
              }
              return category
            })
          ] 
        }
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })
  _chatChannelService.getDeletedChannel()
    .pipe(takeUntil(onDestroy$))
    .subscribe((channel: ChatChannel) => {
      if (router.url.includes(`chatserver/${channel.chatCategory.chatServer.id}`)) return

      const key = environment.apiUrl + `/chatservers/${channel.chatCategory.chatServer.id}`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedData = {
          chatCategories: [
            ...cachedResponse.body.chatCategories.map((category: ChatCategory) => {
              if (category.id == channel.chatCategory.id) {
                return {
                  ...category,
                  chatChannels: category.chatChannels.filter(chatChannel => chatChannel.id !== channel.id),
                }
              }
              return category
            }),
          ],
        }
        
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })
  _chatChannelService.getMovedChannel()
    .pipe(takeUntil(onDestroy$))
    .subscribe((data: [ChatCategory, number]) => {
      if (router.url.includes(`chatserver/${data[0].chatServer.id}`)) return

      const key = environment.apiUrl + `/chatservers/${data[0].chatServer.id}`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedCategories = cachedResponse.body.chatCategories.map((category: ChatCategory) => {
          if (category.id === data[0].id) {
            return { ...category, chatChannels: data[0].chatChannels }
          } else if (category.chatChannels.some(channel => channel.id === data[1])) {
            return { ...category, chatChannels: category.chatChannels.filter(channel => channel.id !== data[1]) }
          } else {
            return category
          }
        })
    
        const updatedData = { ...cachedResponse.body, chatCategories: updatedCategories }
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })
  _chatChannelService.getUpdatedChannel()
    .pipe(takeUntil(onDestroy$))
    .subscribe((channel: ChatChannel) => {
      if (router.url.includes(`chatserver/${channel.chatCategory.chatServer.id}`)) return

      const key = environment.apiUrl + `/chatservers/${channel.chatCategory.chatServer.id}`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedData = {
          chatCategories: [
            ...cachedResponse.body.chatCategories.map((category: ChatCategory) => {
              if (category.id == channel.chatCategory.id) {
                return {
                  ...category,
                  chatChannels: category.chatChannels.map(chatChannel => {
                    if (chatChannel.id == channel.id) {
                      return channel
                    }
                    return chatChannel
                  }),
                }
              }
              return category
            }),
          ],
        }
        
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })
  _chatServerService.getNewMember()
    .pipe(takeUntil(onDestroy$))
    .subscribe((chatServer: ChatServer) => {
      if (router.url.includes(`chatserver/${chatServer.id})`)) return

      const key = environment.apiUrl + `/users/byChatServer/${chatServer.id}`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedData = [
          ...cachedResponse.body,
          ...chatServer.members!.filter(
            (newMember) =>
              !cachedResponse.body.some(
                (existingMember: User) => existingMember.id == newMember.id
              )
          ),
        ]
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })
  _chatServerService.getRemovedMember()
    .pipe(takeUntil(onDestroy$))
    .subscribe((data: any) => {
      const key = environment.apiUrl + `/users/byChatServer/${data.chatServer.id}`
      const cachedResponse = cacheResolver.get(key)

      if (cachedResponse) {
        const updatedData = cachedResponse.body.filter((user: User) => user.id != data.userId)
        const updatedResponse = cachedResponse.clone({ body: updatedData })
        cacheResolver.set(key, updatedResponse)
      }
    })
}