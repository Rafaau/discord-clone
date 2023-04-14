import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateDirectConversationParams, DirectConversation } from '../_models/direct-conversation';
import { environment } from 'src/environments/environment';
import { ApiHelpers } from './helpers';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class DirectConversationService {
  private readonly api = environment.apiUrl

  constructor(
    private readonly httpClient: HttpClient,
    private readonly socket: Socket
  ) { }

  createDirectConversation(
    conversationDetails: CreateDirectConversationParams
  ) {
    this.socket.emit(
      'createDirectConversation',
      conversationDetails
    )
  }

  getNewConversation(): Observable<any> {
    return this.socket.fromEvent<DirectConversation>('newDirectConversation')
  }

  getDirectConversationById(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/directconversations/${id}`,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }
}
