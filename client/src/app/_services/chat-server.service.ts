import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatServer, CreateChatServerParams } from '../_models/chat-servers';

@Injectable({
  providedIn: 'root'
})
export class ChatServerService {
  private readonly api = 'http://localhost:3000'

  constructor(private readonly httpClient: HttpClient) { }

  createChatServer(
    chatServerParams: CreateChatServerParams,
    ownerId: number
  ): Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      this.api+`/chatservers/${ownerId}`, 
      chatServerParams, 
      { observe: 'response' }
    )
  }

  getUserChatServers(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/chatservers/user/${userId}`, 
      { observe: 'response' }
    )
  }

  getChatServerBydId(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(this.api+`/chatservers/${id}`, { observe: 'response' })
  }
}
