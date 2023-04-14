import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { ChatCategory, CreateChatCategoryParams } from '../_models/chat-category';
import { ChatChannel, CreateChatChannelParams, UpdateChatChannelParams } from '../_models/chat-channels';
import { environment } from 'src/environments/environment';
import { ApiHelpers } from './helpers';

@Injectable({
  providedIn: 'root'
})
export class ChatChannelService {
  private readonly api = environment.apiUrl

  constructor(
    private readonly httpClient: HttpClient,
    private readonly socket: Socket
  ) { }

  createChatChannel(
    categoryId: number,
    chatChannelParams: CreateChatChannelParams
  ) {
    this.socket.emit(
      'createChatChannel',
      categoryId,
      chatChannelParams
    )
  }

  getCreatedChannel(): Observable<ChatChannel> {
    return this.socket.fromEvent<ChatChannel>('createdChatChannel')
  }

  createChatCategory(
    serverId: number,
    chatCategoryParams: CreateChatCategoryParams
  ) {
    this.socket.emit(
      'createChatCategory',
      serverId,
      chatCategoryParams
    )
  }

  getCreatedCategory(): Observable<ChatCategory> {
    return this.socket.fromEvent<ChatCategory>('createdChatCategory')
  }

  getChatChannelById(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/chatchannels/${id}`, 
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
      )
  }

  deleteChatChannel(id: number) {
    this.socket.emit('deleteChatChannel', id )
  }

  getDeletedChannel(): Observable<any> {
    return this.socket.fromEvent<any>('deletedChatChannel')
  }

  moveChannel(
    channelId: number,
    destinationIndex: number,
    destinationCategory: number
  ) {
    this.socket.emit(
      'moveChannel', 
      channelId,
      destinationIndex,
      destinationCategory
    )
  }

  getMovedChannel(): Observable<any> {
    return this.socket.fromEvent<any>('movedChannelCategory')
  }

  updateChatChannel(
    id: number,
    chatChannelParams: UpdateChatChannelParams
  ) {
    this.socket.emit(
      'updateChannel', 
      id, 
      chatChannelParams
    )
  }

  getUpdatedChannel(): Observable<any> {
    return this.socket.fromEvent<ChatChannel>('updatedChatChannel')
  }
}
