import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdateUserParams } from '../_models/user';
import { environment } from 'src/environments/environment';
import { ApiHelpers } from './helpers';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly api = environment.apiUrl

  constructor(private readonly httpClient: HttpClient) { }

  getUserById(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/${userId}`,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  getUsersByChatServer(chatServerId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/byChatServer/${chatServerId}`, 
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  getFriendsOfUser(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/${userId}/friends`,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  getConversationsOfUser(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/directconversations/user/${userId}`,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  getFriendRequestsOfUser(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/${userId}/friendRequests`,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.noInterceptHeaders }
    )
  }

  removeFriend(
    userId: number, 
    friendId: number): Observable<HttpResponse<any>> {
      return this.httpClient.patch(
        this.api+`/users/${userId}/removeFriend/${friendId}`,
        null,
        { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
      )
  }

  updateUser(
    userId: number,
    userDetails: UpdateUserParams
  ): Observable<HttpResponse<any>> {
    return this.httpClient.patch(
      this.api+`/users/${userId}`,
      userDetails,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  checkIfPasswordDoesMatch(
    userId: number,
    rawPassword: string
  ): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/${userId}/query?passwordToCheck=${rawPassword}`,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  uploadAvatar(
    userId: number,
    fileToUpload: File
  ): Observable<HttpResponse<any>> {
    const formData: FormData = new FormData()
    formData.append('avatar', fileToUpload, `avatar-${userId}`)
    return this.httpClient.post(
      this.api+`/users/${userId}/uploadAvatar`,
      formData,
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }
}
