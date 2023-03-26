import { animate, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatServer, UpdateChatServerParams } from 'src/app/_models/chat-servers';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { ServerSettingsSnackbar } from './server-settings-snackbar/server-settings-snackbar.component';

@Component({
  selector: 'chat-server-settings',
  templateUrl: './chat-server-settings.component.html',
  styleUrls: ['./chat-server-settings.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale(1.2)',
          filter: 'blur(4px)'
        }),
        animate('0.2s ease-in',
          style({
            opacity: 1,
            transform: 'scale(*)'
          }))
      ]),
      transition(':leave', [
        animate('0.2s ease-out', 
          style({
            opacity: 0,
            transform: 'scale(1.2)',
            filter: 'blur(4px)'
          }))
      ])
    ])
  ]
})
export class ChatServerSettingsComponent implements OnInit, OnChanges {
  @Input()
  chatServer?: ChatServer
  @Output()
  public onClose = new EventEmitter()
  @Output()
  public onSave = new EventEmitter<ChatServer>
  isOpen: boolean = true
  public View = View
  currentView: View = View.Overview
  serverNameValue?: string

  constructor(
    private readonly _chatServerService: ChatServerService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chatServer'] && !this.serverNameValue) {
      this.serverNameValue = this.chatServer!.name
    }
  }

  onCloseClick() {
    this.isOpen = false
    setTimeout(() => {
      this.onClose.emit()
    }, 50)
  }

  onNameValueChange(event: Event) {
    this.serverNameValue = (event.target as any).value

    if (!this.snackbar._openedSnackBarRef) {
      let snackBarRef = this.snackbar.openFromComponent(
        ServerSettingsSnackbar
      )

      const resetSub = snackBarRef.instance.onResetEvent.subscribe(() => {
        this.resetSettings()
        this.snackbar.dismiss()
      })
      snackBarRef.afterDismissed().subscribe(() => resetSub.unsubscribe())

      const saveSub = snackBarRef.instance.onSaveEvent.subscribe(() => {
        this.saveSettings()
        this.snackbar.dismiss()
      })
      snackBarRef.afterDismissed().subscribe(() => saveSub.unsubscribe())
    }
  }

  resetSettings() {
    this.serverNameValue = this.chatServer!.name
  }

  saveSettings() {
    if (this.serverNameValue) {
      const reqBody: UpdateChatServerParams = {
        name: this.serverNameValue
      }
      this._chatServerService.updateChatServer(this.chatServer!.id, reqBody)
        .subscribe(
          (data: HttpResponse<ChatServer>) => {
            this.chatServer = data.body!
            this.onSave.emit(data.body!)
          }
        )
    }
  }
}

export enum View {
  Overview = 'Server Overview',
  Roles = 'Roles'
}
