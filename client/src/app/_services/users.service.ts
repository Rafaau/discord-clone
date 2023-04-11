import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdateUserParams } from '../_models/user';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly api = environment.apiUrl

  constructor(private readonly httpClient: HttpClient) { }

  getUsersByChatServer(chatServerId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/byChatServer/${chatServerId}`, 
      { observe: 'response', withCredentials: true }
    )
  }

  getFriendsOfUser(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/${userId}/friends`,
      { observe: 'response', withCredentials: true }
    )
  }

  getConversationsOfUser(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/directconversations/user/${userId}`,
      { observe: 'response', withCredentials: true }
    )
  }

  getFriendRequestsOfUser(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/${userId}/friendRequests`,
      { observe: 'response', withCredentials: true }
    )
  }

  removeFriend(
    userId: number, 
    friendId: number): Observable<HttpResponse<any>> {
      return this.httpClient.patch(
        this.api+`/users/${userId}/removeFriend/${friendId}`,
        null,
        { observe: 'response', withCredentials: true }
      )
  }

  updateUser(
    userId: number,
    userDetails: UpdateUserParams
  ): Observable<HttpResponse<any>> {
    return this.httpClient.patch(
      this.api+`/users/${userId}`,
      userDetails,
      { observe: 'response', withCredentials: true }
    )
  }

  checkIfPasswordDoesMatch(
    userId: number,
    rawPassword: string
  ): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/${userId}/query?passwordToCheck=${rawPassword}`,
      { observe: 'response', withCredentials: true }
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
      { observe: 'response', withCredentials: true }
    )
  }
}
