import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { ChatMessage, CreateChatMessageParams, UpdateChatMessageParams } from '../_models/chat-message';
import { ApiHelpers } from './helpers';

@Injectable({
  providedIn: 'root'
})
export class ChatMessagesService {
  private readonly api = 'http://localhost:3000'

  constructor(
    private readonly httpClient: HttpClient,
    private readonly socket: Socket
  ) { }

  getChatMessages(
    channelId: number,
    page: number
  ): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/chatmessages?filterByChannel=${channelId}&page=${page}`, 
      { observe: 'response' }
    )
  }

  postChatMessage(
    channelId: number, 
    userId: number,
    chatMessageParams: CreateChatMessageParams
  ): Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      this.api+`/chatmessages/channel=${channelId}/user=${userId}`, 
      chatMessageParams,
      { observe: 'response' }
    )
  }

  sendMessage(
    channelId: number,
    userId: number,
    chatMessageParams: CreateChatMessageParams
  ) {
    this.socket.emit(
      'sendChatMessage',
      channelId,
      userId,
      chatMessageParams
    )
  }

  getNewMessage(): Observable<any> {
    return this.socket.fromEvent<ChatMessage>('newChatMessage')
  }

  editMessage(
    id: number,
    chatMessageParams: UpdateChatMessageParams
  ) {
    this.socket.emit(
      'editChatMessage',
      id,
      chatMessageParams
    ) 
  }

  getEditedMessage(): Observable<any> {
    return this.socket.fromEvent<ChatMessage>('editedChatMessage')
  }

  deleteMessage(id: number) {
    this.socket.emit(
      'deleteChatMessage',
      id
    )
  }

  getDeletedMessage(): Observable<any> {
    return this.socket.fromEvent<number>('deletedChatMessage')
  }

  updateChatMessage(
    id: number,
    chatMessageParams: UpdateChatMessageParams
  ): Observable<HttpResponse<{}>> {
    return this.httpClient.patch(
      this.api+`/chatmessages/${id}`,
      chatMessageParams,
      { observe: 'response', headers: ApiHelpers.headers }
    )
  }

  deleteChatMessage(id: number): Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      this.api+`/chatmessages/${id}`, 
      { observe: 'response' }
    )
  }
}
