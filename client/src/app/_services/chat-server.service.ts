import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatServer, CreateChatServerParams, UpdateChatServerParams } from '../_models/chat-servers';
import { environment } from 'src/environments/environment';
import { ApiHelpers } from './helpers';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ChatServerService {
  private readonly api = environment.apiUrl

  constructor(
    private readonly httpClient: HttpClient,
    private readonly socket: Socket
  ) { }

  createChatServer(
    chatServerParams: CreateChatServerParams,
    ownerId: number
  ): Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      this.api+`/chatservers/${ownerId}`, 
      chatServerParams, 
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  getUserChatServers(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/chatservers/user/${userId}`, 
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  getChatServerById(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/chatservers/${id}`, 
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
      )
  }

  getChatServerInvitationDetails(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/chatservers/invitationDetails/${id}`,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.noInterceptHeaders }
    )
  }
  
  addMemberToChatServer(
    chatServerId: number,
    userId: number
  ) {
    this.socket.emit(
      'addMemberToChatServer', 
      userId,
      chatServerId
    )
  }

  getNewMember(): Observable<any> {
    return this.socket.fromEvent<ChatServer>('newChatServerMember')
  }

  updateChatServer(
    id: number,
    serverDetails: UpdateChatServerParams
  ): Observable<HttpResponse<any>> {
    return this.httpClient.patch(
      this.api+`/chatservers/${id}`,
      serverDetails,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  deleteChatServer(id: number) {
    this.socket.emit('deleteChatServer', id)
  }

  getDeletedChatServer(): Observable<any> {
    return this.socket.fromEvent<ChatServer>('deletedChatServer')
  }

  uploadAvatar(
    id: number,
    fileToUpload: File
  ): Observable<HttpResponse<any>> {
    const formData: FormData = new FormData()
    formData.append('avatar', fileToUpload, `avatar-${id}`)
    return this.httpClient.post(
      this.api+`/chatservers/${id}/uploadAvatar`,
      formData,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  removeMemberFromChatServer(
    chatServerId: number,
    userId: number
  ) {
    this.socket.emit(
      'removeMemberFromChatServer',
      userId,
      chatServerId
    )
  }

  getRemovedMember(): Observable<any> {
    return this.socket.fromEvent<any>('removedChatServerMember')
  }
}
