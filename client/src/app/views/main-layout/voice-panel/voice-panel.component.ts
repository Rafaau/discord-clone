import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { Subject, filter, takeUntil } from 'rxjs';
import { ChatChannel } from 'src/app/_models/chat-channels';
import { User } from 'src/app/_models/user';
import { VoiceService } from 'src/app/_services/voice.service';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';

@Component({
  selector: 'voice-panel',
  templateUrl: './voice-panel.component.html',
  styleUrls: ['./voice-panel.component.css']
})
export class VoicePanelComponent implements OnInit, OnDestroy {
  currentUser?: User
  currentVoiceChannel?: ChatChannel
  isMuted: boolean = false
  onDestroy$ = new Subject<void>()
  peer?: Peer
  peerId?: string
  peerList: any[] = []
  activeCalls: MediaConnection[] = []
  currentPeer?: RTCPeerConnection // ?
  mutedPeers: { [peerId: string]: boolean } = {}
  dataConnections: DataConnection[] = []
  userStream?: MediaStream // ?
  channelVoiceUsers = new Map<string, number[]>()
  currentServerId: number = 0

  constructor(
    private readonly _voiceService: VoiceService,
    private readonly _sharedDataProvider: SharedDataProvider,
    private readonly router: Router
  ) { }

  ngOnInit() { 
    this.router.events
      .pipe(
        takeUntil(this.onDestroy$),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        if (this.router.url.includes(`chatserver/${this.currentServerId})`))
          for (const [peerId, isMuted] of Object.entries(this.mutedPeers)) {
            if (isMuted) {
              const mutedIcon = document.getElementById(`${peerId}-muted`) as HTMLElement
              if (mutedIcon)
                mutedIcon.style.display = 'block'
            }
          }
      })
    this._sharedDataProvider.getCurrentUser()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(user => {
        if (!user) return
        this.currentUser = user
        this.peer = new Peer(`user-${user.id}`)
        this.initPeerConnection()
        if (user.currentVoiceChannel) {
          this.currentVoiceChannel = user.currentVoiceChannel
          user.currentVoiceChannel.voiceUsers.forEach((voiceUser: User) => {
            this.setVoiceUsers({ voiceChannelId: user.currentVoiceChannel!.id, user: voiceUser })
          })
          this.joinVoiceChannel(user.currentVoiceChannel)
        }
      })
    this._sharedDataProvider.voiceUser
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((data) => {
        this.setVoiceUsers(data)
      })
    this._voiceService.voiceChannelEvent
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(({ voiceChannel, userId }) => {
        this.joinVoiceChannel(voiceChannel)
      })
    this._voiceService.getJoinedVoiceChannel()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (data) => {
          this.setVoiceUsers(data)
        })
    this._voiceService.getLeftVoiceChannel()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (data) => {
          const voiceUsers = this.channelVoiceUsers.get(`channel-${data.voiceChannelId}`)!
          this.channelVoiceUsers.set(`channel-${data.voiceChannelId}`, voiceUsers.filter(x => x != data.user.id))
          this.peerList = this.peerList.filter(x => x != `user-${data.user.id}`)
          this.currentServerId = 0
        })     
  }

  ngOnDestroy() {
    this.onDestroy$.next()
    this.onDestroy$.complete()
  }

  joinVoiceChannel(voiceChannel: ChatChannel) {
    if (this.currentVoiceChannel)
      this.leaveVoiceChannel()
    this.currentVoiceChannel = voiceChannel
    setTimeout(() => {
      this._voiceService.joinVoiceChannel(this.currentUser!.id, voiceChannel.id)
    }, 100)
    this.currentVoiceChannel = voiceChannel
    const voiceUsers = this.channelVoiceUsers.get(`channel-${voiceChannel.id}`)
    voiceUsers?.forEach(x => {
      if (x == this.currentUser!.id) return
      this.callPeer(`user-${x}`)
    })
  }

  leaveVoiceChannel() {
    this._voiceService.leaveVoiceChannel(this.currentUser!.id, this.currentVoiceChannel!.id)
    this.activeCalls.forEach(x => x.close())
    this.activeCalls = []
    this.peerList = []
    this.isMuted = false
    this.dataConnections.forEach(x => {
      x.send({ type: 'mute', isMuted: false, peerId: this.peerId })
    })
    this.mutedPeers[this.peerId!] = false
    const leaveSound = document.getElementById('leaveSound') as HTMLAudioElement
    leaveSound.currentTime = 0
    leaveSound.play()
    this.currentVoiceChannel = undefined
  }

  setVoiceUsers(data: any) {
    const voiceUsers = this.channelVoiceUsers.get(`channel-${data.voiceChannelId}`)
    if (!voiceUsers) {
      this.channelVoiceUsers.set(`channel-${data.voiceChannelId}`, [data.user.id])
      return
    } else if (!voiceUsers.includes(data.user.id)) {
      this.channelVoiceUsers.set(`channel-${data.voiceChannelId}`, [...voiceUsers, data.user.id])
    }
      this.currentServerId = data.serverId
  }

  initPeerConnection() {
    this.peer?.on('open', id => {
      console.log('client opened')
      this.peerId = id
    })

    this.peer?.on('call', call => {
      console.log('called')
      console.log(this.peerList)
      if (!this.peerList.includes(call.peer))
        this.callPeer(call.peer)
      this.activeCalls.push(call)
      navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: false 
      }).then(stream => {
        call.answer(stream)
        call.on('stream', remoteStream => {
          console.log('rec')
          this.currentPeer = call.peerConnection
          this.peerList.push(call.peer)
          this.monitorAudioLevel(false, call.peer, remoteStream, document.getElementById(call.peer)!)
        })
      }).catch(err => {
        console.log(err)
      })
    })

    this.peer?.on('connection', dataConnection => {
      dataConnection.on('data', (data: any) => {
        console.log(data)
        if (data.type == 'mute')
          this.mutedPeers[data.peerId] = data.isMuted
          const mutedIcon = document.getElementById(`${data.peerId}-muted`) as HTMLElement
          if (mutedIcon)
            mutedIcon.style.display = data.isMuted ? 'block' : 'none'
      })
    })

    this.peer?.on('close', () => {
      console.log('closed')
    })
  }

  callPeer(id: string) {
    navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
      video: false 
    }).then(stream => {
      const call = this.peer!.call(id, stream)
      const dataConnection = this.peer!.connect(id)
      this.dataConnections.push(dataConnection)
      this.activeCalls.push(call)
      this.userStream = stream
      call!.on('stream', remoteStream => {
        console.log('stream')
          this.currentPeer = call.peerConnection
          this.monitorAudioLevel(true, this.peerId!, remoteStream, document.getElementById(`user-${this.currentUser!.id}`)!)
      })
      call!.on('close', () => {
        console.log('close')
      })
      dataConnection.on('open', () => {
        console.log('dc opened')
      })
    }).catch(err => {
      console.log(err)
    })
  }

  monitorAudioLevel(
    local: boolean, peerId: 
    string, stream: 
    MediaStream, 
    element: HTMLElement, 
    threshold: number = 35
  ) {
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)
  
    analyser.fftSize = 32
    source.connect(analyser)
  
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    let active = false
    const remoteAudio = document.getElementById('remoteAudio')! as HTMLAudioElement

    if (!local) {
      remoteAudio.srcObject = stream
    }

    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray)
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length
      if (avg > threshold && !active && !this.mutedPeers[peerId]) {
        active = true
        document.getElementById(peerId)?.classList.add('active')
        remoteAudio.play()
      } else if (avg <= threshold && active) {
        active = false
        document.getElementById(peerId)?.classList.remove('active')
        remoteAudio.pause()
      }
  
      requestAnimationFrame(checkAudioLevel)
    }
  
    checkAudioLevel()
  }

  muteUser() {
    this.userStream!.getAudioTracks().forEach(x => {
      x.enabled = false
    })
    this.isMuted = true
    this.dataConnections.forEach(x => {
      x.send({ type: 'mute', isMuted: true, peerId: this.peerId })
    })
    this.mutedPeers[this.peerId!] = true
    const muteIcon = document.getElementById(`${this.peerId}-muted`)!
    muteIcon.style.display = 'block'
    const muteSound = document.getElementById('muteSound')! as HTMLAudioElement
    const avatar = document.getElementById(`user-${this.currentUser!.id}`)!
    avatar.classList.remove('active')
    muteSound.currentTime = 0
    muteSound.play()
  }

  unmuteUser() {
    this.userStream!.getAudioTracks().forEach(x => {
      x.enabled = true
    })
    this.isMuted = false
    this.dataConnections.forEach(x => {
      x.send({ type: 'mute', isMuted: false, peerId: this.peerId })
    })
    this.mutedPeers[this.peerId!] = false
    const muteIcon = document.getElementById(`${this.peerId}-muted`)!
    muteIcon.style.display = 'none'
    const unmuteSound = document.getElementById('unmuteSound')! as HTMLAudioElement
    unmuteSound.currentTime = 0
    unmuteSound.play()
  }
}
