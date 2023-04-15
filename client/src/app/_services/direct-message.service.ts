import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { CreateDirectMessageParams, DirectMessage, UpdateDirectMessageParams } from '../_models/direct-message';
import { environment } from 'src/environments/environment';
import { ApiHelpers } from './helpers';

@Injectable({
  providedIn: 'root'
})
export class DirectMessageService {
  private readonly api = environment.apiUrl

  constructor(
    private readonly httpClient: HttpClient,
    private readonly socket: Socket
  ) { }

  createDirectMessage(
    conversationId: number,
    senderId: number,
    directMessageParams: CreateDirectMessageParams
  ): Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      this.api+`/directmessages/conversation=${conversationId}/sender=${senderId}`,
      directMessageParams,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  sendMessage(
    conversationId: number,
    senderId: number,
    directMessageParams: CreateDirectMessageParams
  ) {
    this.socket.emit(
      'sendDirectMessage', 
      conversationId,
      senderId,
      directMessageParams
    )
  }

  getNewMessage(): Observable<any> {
    return this.socket.fromEvent<DirectMessage>('newDirectMessage')
  }

  editMessage(
    id: number,
    directMessageParams: UpdateDirectMessageParams
  ) {
    this.socket.emit(
      'editDirectMessage',
      id,
      directMessageParams
    )
  }

  getEditedMessage(): Observable<any> {
    return this.socket.fromEvent<DirectMessage>('editedDirectMessage')
  }

  deleteMessage(id: number) {
    this.socket.emit(
      'deleteDirectMessage',
      id
    )
  }

  getDeletedMessage(): Observable<any> {
    return this.socket.fromEvent<DirectMessage>('deletedDirectMessage')
  }

  getDirectMessagesByConversation(
    conversationId: number,
    page: number
  ): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/directmessages?conversation=${conversationId}&page=${page}`, 
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  getSingleMessage(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/directmessages/${id}`,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  updateDirectMessage(
    id: number,
    directMessageParams: UpdateDirectMessageParams
  ): Observable<HttpResponse<any>> {
    return this.httpClient.patch(
      this.api+`/directmessages/${id}`,
      directMessageParams,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  deleteDirectMessage(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.delete(
      this.api+`/directmessages/${id}`,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }
}
