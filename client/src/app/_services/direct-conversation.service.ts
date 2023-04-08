import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateDirectConversationParams } from '../_models/direct-conversation';

@Injectable({
  providedIn: 'root'
})
export class DirectConversationService {
  private readonly api = 'http://localhost:3000'

  constructor(private readonly httpClient: HttpClient) { }

  createDirectConversation(
    conversationDetails: CreateDirectConversationParams
  ): Observable<HttpResponse<any>> {
    return this.httpClient.post(
      this.api+`/directconversations`,
      conversationDetails,
      { observe: 'response', withCredentials: true }
    )
  }

  getDirectConversationById(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/directconversations/${id}`,
      { observe: 'response', withCredentials: true }
    )
  }
}
