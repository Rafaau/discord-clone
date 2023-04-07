import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserParams, LoginUserParams } from '../_models/Users';
import { ApiHelpers } from './helpers';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = 'http://localhost:3000'
  constructor(
    private readonly httpClient: HttpClient,
    private socket: Socket
  ) { }

  authorizeUser(loginCredentials: LoginUserParams): Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      this.api+'/auth/login', 
      loginCredentials, 
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  getAuthStatus() : Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+'/auth/status', 
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }

  getAuthSession() : Observable<HttpResponse<{}>> {
    return this.httpClient.get(
      this.api+'/auth', 
      { observe: 'response' }
    )
  }

  registerAccount(accountDetails: CreateUserParams) : Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      this.api+'/users', 
      accountDetails, 
      { observe: 'response' }
    )
  }

  joinRoom(userId: string) {
    this.socket.emit('join', { userId: userId })
  }

  logout() : Observable<HttpResponse<{}>> {
    return this.httpClient.get(
      this.api+'/auth/logout', 
      { observe: 'response', withCredentials: true, headers: ApiHelpers.headers }
    )
  }
}
