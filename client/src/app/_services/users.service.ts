import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly api = 'http://localhost:3000'

  constructor(private readonly httpClient: HttpClient) { }

  getUsersByChatServer(chatServerId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/byChatServer/${chatServerId}`, 
      { observe: 'response' }
    )
  }

  getFriendsOfUser(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/${userId}/friends`,
      { observe: 'response' }
    )
  }

  getConversationsOfUser(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/directconversations/user/${userId}`,
      { observe: 'response' }
    )
  }
}
