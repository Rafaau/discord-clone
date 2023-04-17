import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {

  constructor(
    private readonly socket: Socket
  ) { }

  joinVoiceChannel(userId: number, voiceChannelId: number) {
    this.socket.emit('joinVoiceChannel', { userId, voiceChannelId })
  }

  leaveVoiceChannel(userId: number, voiceChannelId: number) {
    this.socket.emit('leaveVoiceChannel', { userId, voiceChannelId })
  }

  getJoinedVoiceChannel() {
    return this.socket.fromEvent<{voiceChannelId: number, user: User}>('joinedVoiceChannel')
  }

  getLeftVoiceChannel() {
    return this.socket.fromEvent<{voiceChannelId: number, user: User}>('leftVoiceChannel')
  }
}
