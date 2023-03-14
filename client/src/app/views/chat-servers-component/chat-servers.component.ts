import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatServer } from 'src/app/_models/chat-servers';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations'
import { AddServerDialog } from './add-server-dialog/add-server-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/_models/Users';

@Component({
  selector: 'app-chat-servers',
  templateUrl: './chat-servers.component.html',
  styleUrls: ['./chat-servers.component.css'],
  animations: [
    trigger('routeChange', [
      transition(':enter', [
        style({
          transform: 'translateX(2px) scale(0.5)'
        }),
        animate('0.3s ease',
          style({
            transform: 'translateX(*) scale(1)'
        }))
      ]),
      transition(':leave', [
        animate('0.2s',
          style({
            transform: 'scale(0)'
          }))
      ])
    ])
  ]
})
export class ChatServersComponent implements OnInit {
  chatServers: ChatServer[] = []
  @Input()
  currentUser?: User

  constructor(
    private readonly _chatServerService: ChatServerService,
    public router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getChatServers(this.currentUser!.id)
  }

  getChatServers(userId: number) {
    this._chatServerService.getUserChatServers(userId).subscribe(
      (data: HttpResponse<ChatServer[]>) => {
        this.chatServers = data.body!
        console.log("servers fetched")
      }
    )
  }

  redirectTo(route: string) {
    this.router.navigate(
      ['/chatserver'], 
      { queryParams: { id: route } }
    )
  }

  redirectToHome() {
    this.router.navigate(['/directmessages'])
  }

  openAddServerDialog() {
    let dialogRef = this.dialog.open(AddServerDialog, {
      data: { name: 'Rafau' },
      width: '450px',
      panelClass: 'add-server-dialog',
      height: '272px'
    })
    const sub = dialogRef.componentInstance.onCreate.subscribe(() => {
      this.getChatServers(this.currentUser!.id)
      setTimeout(() => {
        const lastChatServer = this.chatServers.sort((a,b) => a.id - b.id)[this.chatServers.length - 1]
        this.router.navigate(
          ['/chatserver'], 
          { queryParams: { id: lastChatServer.id } }
        )
      }, 100)
    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })
  }
}
