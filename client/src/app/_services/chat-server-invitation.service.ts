import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatServerInvitationService {
  api: string = 'http://localhost:3000'

  constructor(
    private readonly httpClient: HttpClient
  ) { }

  generateChatServerInvitation(
    chatServerId: number
  ): Observable<HttpResponse<any>> {
    return this.httpClient.post(
      this.api+`/invitations/${chatServerId}`,
      {},
      { observe: 'response', withCredentials: true }
    )
  }

  getInvitationByChatServer(
    chatServerId: number
  ): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/invitations/bychatserver/${chatServerId}`,
      { observe: 'response', withCredentials: true }
    )
  }

  getInvitationByUuid(
    uuid: string
  ): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/invitations/${uuid}`,
      { observe: 'response', withCredentials: true }
    )
  }
}
