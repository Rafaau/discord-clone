import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { User } from '../_models/user';
import { ChatChannel } from '../_models/chat-channels';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  public voiceChannelEvent: EventEmitter<any> = new EventEmitter()

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
    return this.socket.fromEvent<{ voiceChannelId: number, user: User, serverId: number }>('joinedVoiceChannel')
  }

  getLeftVoiceChannel() {
    return this.socket.fromEvent<{ voiceChannelId: number, user: User, serverId: number }>('leftVoiceChannel')
  }

  emitVoiceChannel(
    voiceChannel: ChatChannel,
    userId: number
  ) {
    this.voiceChannelEvent.emit({ voiceChannel, userId })
  }
}
