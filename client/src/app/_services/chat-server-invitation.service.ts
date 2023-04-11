import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiHelpers } from './helpers';

@Injectable({
  providedIn: 'root'
})
export class ChatServerInvitationService {
  readonly api: string = environment.apiUrl

  constructor(
    private readonly httpClient: HttpClient
  ) { }

  generateChatServerInvitation(
    chatServerId: number
  ): Observable<HttpResponse<any>> {
    return this.httpClient.post(
      this.api+`/invitations/${chatServerId}`,
      {},
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  getInvitationByChatServer(
    chatServerId: number
  ): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/invitations/bychatserver/${chatServerId}`,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  getInvitationByUuid(
    uuid: string
  ): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/invitations/${uuid}`,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }
}
