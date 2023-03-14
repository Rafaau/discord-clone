import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateDirectMessageParams, UpdateDirectMessageParams } from '../_models/direct-message';

@Injectable({
  providedIn: 'root'
})
export class DirectMessageService {
  private readonly api = 'http://localhost:3000'

  constructor(private readonly httpClient: HttpClient) { }

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

  getDirectMessagesByConversation(
    conversationId: number
  ): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/directmessages/${conversationId}`, 
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
