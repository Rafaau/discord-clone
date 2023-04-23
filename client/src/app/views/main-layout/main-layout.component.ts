import { animate, state, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { ChatServer } from 'src/app/_models/chat-servers';
import { Notification } from 'src/app/_models/notification';
import { Role } from 'src/app/_models/role';
import { User } from 'src/app/_models/user';
import { AuthService } from 'src/app/_services/auth.service';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { RolesService } from 'src/app/_services/roles.service';
import { ChatServerSettingsComponent } from '../chat-channels-component/chat-server-settings/chat-server-settings.component';
import { ChatServersComponent } from '../chat-servers-component/chat-servers.component';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';
import { Subject, filter, takeUntil } from 'rxjs';
import { ChatMessagesService } from 'src/app/_services/chat-messages.service';
import { MessageReactionsService } from 'src/app/_services/message-reactions.service';
import { DirectMessageService } from 'src/app/_services/direct-message.service';
import { initListeners } from 'src/app/utils/CacheListeners';
import { ChatChannelService } from 'src/app/_services/chat-channel.service';
import { CacheResolverService } from 'src/app/utils/CacheResolver.service';
import { UsersService } from 'src/app/_services/users.service';
import { ChatChannel } from 'src/app/_models/chat-channels';
import { VoiceService } from 'src/app/_services/voice.service';
import { environment } from 'src/environments/environment';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import KeenSlider, { KeenSliderInstance } from 'keen-slider';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  animations: [
    trigger('settingsToggle', [
      state('open', 
        style({
         opacity: 0,
         transform: 'scale(0.9)',
         filter: 'blur(4px)' 
        })),
      state('closed', 
        style({
          opacity: 1,
          transform: 'scale(*)'
        })),
      transition('closed => open', [
        animate('0.2s ease-in')
      ]),
      transition('open => closed', [
        animate('0.2s ease-out')
      ])
    ])
  ]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  members: User[] = []
  notifications: Notification[] = []
  currentUser?: User
  currentRoute = new LocationHrefProvider(this.location)
  @ViewChild(ChatServersComponent) chatServersChild?: ChatServersComponent
  @ViewChild(ChatServerSettingsComponent) serverSettingsChild?: ChatServerSettingsComponent
  serverSettingsState: boolean = false
  userSettingsState: boolean = false
  chatServerToPass?: ChatServer
  onDestroy$ = new Subject<void>()
  currentVoiceChannel?: ChatChannel
  environment = environment
  isMobile: boolean = false
  displayMap = new Map([
    [Breakpoints.XSmall, true],
    [Breakpoints.Small, false],
  ])
  @ViewChild('sliderRef') sliderRef?: ElementRef
  slider: KeenSliderInstance | null = null
  currentSlide: number = 1

  constructor(
    private readonly _authService: AuthService,
    private readonly _rolesService: RolesService,
    private readonly _sharedDataProvider: SharedDataProvider,
    private readonly _chatMessagesService: ChatMessagesService,
    private readonly _messageReactionsService: MessageReactionsService,
    private readonly _directMessagesService: DirectMessageService,
    private readonly _chatChannelService: ChatChannelService,
    private readonly _cacheResolver: CacheResolverService,
    private readonly _usersService: UsersService,
    private readonly _chatServerService: ChatServerService,
    private readonly _voiceService: VoiceService,
    public router: Router,
    private location: Location,
    private breakpointObserver: BreakpointObserver
  ) { 
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      for (let query of Object.keys(result.breakpoints)) {
        if (result.breakpoints[query]) {
          this.isMobile = this.displayMap.get(query) ?? false
          if (this.isMobile) {
            setTimeout(() => {
              this.slider = new KeenSlider(this.sliderRef?.nativeElement, {
                initial: this.currentSlide,     
                range: { min: 0, max: 1 },
                rubberband: false,
                slideChanged: s => {
                  this.currentSlide = s.track.details.rel
                  this._sharedDataProvider.emitCurrentSlide(this.currentSlide)
                }
              })
            }, 100)
          } else 
            this.slider?.destroy()
        }
      }
    })
    this.router.events
      .pipe(
        takeUntil(this.onDestroy$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        this.slider?.moveToIdx(1)
      })
  }

  async ngOnInit() {
    await this.authorizeUser()
    this._rolesService.getRoleUpdated()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((role: Role) => {
        if (role.users.some(x => x.id == this.currentUser!.id)) {
          this.currentUser!.roles!.find(x => x.id == role.id)!.permissions = role.permissions
        }
      })
    this._sharedDataProvider.serverSettings.subscribe((event: ChatServer) => {
      this.serverSettingsState = !this.serverSettingsState
      if (event != undefined)
        this.chatServerToPass = event
      else
        this.chatServerToPass = undefined
    })
    this._sharedDataProvider.updatedUser.subscribe((event: number) => {
      this.fetchUser(event)
    })

    initListeners(
      this.onDestroy$,
      this._chatMessagesService,
      this._sharedDataProvider,
      this._messageReactionsService,
      this._directMessagesService,
      this._chatChannelService,
      this._chatServerService,
      this._voiceService,
      this._cacheResolver,
      this.router,
    )

    if (this.router.url == '/')
      this.router.navigate([{ outlets: { main: 'friends', secondary: 'directmessages' } }])
  }

  ngOnDestroy() {
    this.onDestroy$.next()
    this.onDestroy$.complete()
  }


  fetchUsersFromServer(users: User[]) {
    this.members = users
  }

  fetchNotificationsFromServers(notifications: Notification[]) {
    this.notifications = notifications
  }

  refreshUser(user: User) {
    this.currentUser = user
  }

  refreshChatServers(event: Event) {
    this.chatServersChild?.getChatServers(this.currentUser!.id)
  }

  async authorizeUser() {
    await this._authService.getAuthStatus().subscribe(
      async (data: HttpResponse<User>) => {
        console.log('authorized')
        this.fetchUser(data.body!.id)
      },
      (error) => {
        console.log('unauthorized')
        this.router.navigate([''])
          .then(() => {
            this.router.navigate(['login'])
          })
      }
    )
  }

  async fetchUser(userId: number) {
    await this._usersService.getUserById(userId).subscribe(
      (data: HttpResponse<User>) => {
        this.currentUser = data.body!
        this._sharedDataProvider.setCurrentUser(this.currentUser)
        this._authService.joinRoom(this.currentUser!.id.toString())
      },
      (error) => {
        console.log(error)
      }
    )
  }

  toggleServerSettingsView(event: ChatServer) {
    this.serverSettingsState = !this.serverSettingsState
    if (event != undefined)
      this.chatServerToPass = event
    else
      this.chatServerToPass = undefined
  }

  toggleUserSettingsView(event: Event) {
    this.userSettingsState = !this.userSettingsState
  }
}
