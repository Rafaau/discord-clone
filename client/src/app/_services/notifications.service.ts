import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { CreateNotificationParams } from '../_models/notification';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly api = environment.apiUrl

  constructor(
    private readonly httpClient: HttpClient,
    private readonly socket: Socket
  ) { }

  getUnreadNotificationsForUser(userId: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.api+`/notifications/${userId}`,
      { observe: 'response' }
    )
  }

  createNotification(
    userId: number,
    notificationDetails: CreateNotificationParams
  ) {
    this.socket.emit(
      'createNotification',
      notificationDetails,
      userId,
    )
  }

  getNewNotification(): Observable<any> {
    return this.socket.fromEvent<Notification>('newNotification')
  }

  markAsRead(
    id: number, 
    userId: number
  ) {
    this.socket.emit(
      'markAsRead',
      id,
      userId
    )
  }

  getReadedNotification(): Observable<any> {
    return this.socket.fromEvent<Notification>('readedNotification')
  }
}
