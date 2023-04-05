import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { FriendRequest } from '../_models/friend-request';

@Injectable({
  providedIn: 'root'
})
export class FriendRequestsService {

  constructor(
    private readonly socket: Socket
  ) { }

  sendFriendRequest(
    senderId: number,
    receiverUsername: string
  ) {
    this.socket.emit(
      'sendFriendRequest',
      senderId,
      receiverUsername
    )
  }

  getNewFriendRequest(): Observable<any> {
    return this.socket.fromEvent<any>('newFriendRequest')
  }

  acceptFriendRequest(id: number) {
    this.socket.emit('acceptFriendRequest', id)
  }

  getAcceptedFriendRequest(): Observable<any> {
    return this.socket.fromEvent<FriendRequest>('acceptedFriendRequest')
  }

  declineFriendRequest(id: number) {
    this.socket.emit('declineFriendRequest', id)
  }

  getDeclinedFriendRequest(): Observable<any> {
    return this.socket.fromEvent<FriendRequest>('declinedFriendRequest')
  }
}
