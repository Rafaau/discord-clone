import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdateUserParams } from '../_models/Users';

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

  updateUser(
    userId: number,
    userDetails: UpdateUserParams
  ): Observable<HttpResponse<any>> {
    return this.httpClient.patch(
      this.api+`/users/${userId}`,
      userDetails,
      { observe: 'response' }
    )
  }

  checkIfPasswordDoesMatch(
    userId: number,
    rawPassword: string
  ): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/users/${userId}/query?passwordToCheck=${rawPassword}`,
      { observe: 'response' }
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
      { observe: 'response' }
    )
  }
}
