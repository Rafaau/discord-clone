import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatMessage, CreateChatMessageParams, UpdateChatMessageParams } from '../_models/chat-message';
import { ApiHelpers } from './helpers';

@Injectable({
  providedIn: 'root'
})
export class ChatMessagesService {
  private readonly api = 'http://localhost:3000'

  constructor(private readonly httpClient: HttpClient) { }

  getChatMessages(channelId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(this.api+`/chatmessages?filterByChannel=${channelId}`, { observe: 'response' })
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
