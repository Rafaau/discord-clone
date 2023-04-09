import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateDirectConversationParams } from '../_models/direct-conversation';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DirectConversationService {
  private readonly api = environment.apiUrl

  constructor(private readonly httpClient: HttpClient) { }

  createDirectConversation(
    conversationDetails: CreateDirectConversationParams
  ): Observable<HttpResponse<any>> {
    return this.httpClient.post(
      this.api+`/directconversations`,
      conversationDetails,
      { observe: 'response' }
    )
  }

  getDirectConversationById(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/directconversations/${id}`,
      { observe: 'response' }
    )
  }
}
