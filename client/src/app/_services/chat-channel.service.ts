import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateChatCategoryParams } from '../_models/chat-category';
import { ChatChannel, CreateChatChannelParams } from '../_models/chat-channels';

@Injectable({
  providedIn: 'root'
})
export class ChatChannelService {
  private readonly api = 'http://localhost:3000'

  constructor(
    private readonly httpClient: HttpClient
  ) { }

  createChatChannel(
    categoryId: number, 
    chatChannelParams: CreateChatChannelParams
  ): Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      this.api+`/chatchannels/${categoryId}`, 
      chatChannelParams, 
      { observe: 'response' }
    )
  }

  createChatCategory(
    serverId: number,
    chatCategoryParams: CreateChatCategoryParams
  ): Observable<HttpResponse<any>> {
    return this.httpClient.post(
      this.api+`/chatchannels/category/${serverId}`,
      chatCategoryParams,
      { observe: 'response' }
    )
  }

  getChatChannelById(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(this.api+`/chatchannels/${id}`, { observe: 'response' })
  }
}
