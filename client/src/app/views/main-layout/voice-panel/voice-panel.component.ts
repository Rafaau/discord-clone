import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ChatChannel } from 'src/app/_models/chat-channels';
import { VoiceService } from 'src/app/_services/voice.service';

@Component({
  selector: 'voice-panel',
  templateUrl: './voice-panel.component.html',
  styleUrls: ['./voice-panel.component.css']
})
export class VoicePanelComponent implements OnInit, OnDestroy {
  currentVoiceChannel?: ChatChannel
  isMuted: boolean = false
  onDestroy$ = new Subject<void>()

  constructor(
    private readonly _voiceService: VoiceService
  ) { }

  ngOnInit() {
    this._voiceService.voiceChannelEvent
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((voiceChannel: ChatChannel) => {
        console.log('log')
        this.currentVoiceChannel = voiceChannel
      })
  }

  ngOnDestroy() {
    this.onDestroy$.next()
    this.onDestroy$.complete()
  }

  leaveVoiceChannel() {
  
  }

  muteUser() {

  }

  unmuteUser() {
  
  }
}
