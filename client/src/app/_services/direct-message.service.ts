import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { CreateDirectMessageParams, DirectMessage, UpdateDirectMessageParams } from '../_models/direct-message';

@Injectable({
  providedIn: 'root'
})
export class DirectMessageService {
  private readonly api = 'http://localhost:3000'

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
      { observe: 'response' }
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
    return this.socket.fromEvent<number>('deletedDirectMessage')
  }

  getDirectMessagesByConversation(
    conversationId: number,
    page: number
  ): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/directmessages?conversation=${conversationId}&page=${page}`, 
      { observe: 'response' }
    )
  }

  getSingleMessage(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/directmessages/${id}`,
      { observe: 'response' }
    )
  }

  updateDirectMessage(
    id: number,
    directMessageParams: UpdateDirectMessageParams
  ): Observable<HttpResponse<any>> {
    return this.httpClient.patch(
      this.api+`/directmessages/${id}`,
      directMessageParams,
      { observe: 'response' }
    )
  }

  deleteDirectMessage(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.delete(
      this.api+`/directmessages/${id}`,
      { observe: 'response' }
    )
  }
}
