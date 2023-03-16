import { HttpResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatServerInvitation } from 'src/app/_models/chat-server-invitation';
import { ChatServerInvitationService } from 'src/app/_services/chat-server-invitation.service';

@Component({
  selector: 'app-generate-invitation',
  templateUrl: './generate-invitation.component.html',
  styleUrls: ['./generate-invitation.component.css']
})
export class GenerateInvitationDialog implements OnInit {
  invitation?: ChatServerInvitation

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { serverId: number },
    private readonly _chatServerInvitationService: ChatServerInvitationService
  ) { }

  ngOnInit() {
    this.checkIfAlreadyGenerated()
  }

  checkIfAlreadyGenerated() {
    this._chatServerInvitationService.getInvitationByChatServer(this.data.serverId)
      .subscribe(
        (data: HttpResponse<ChatServerInvitation>) => {
          if (new Date(data.body!.expirationTime).getDate() != new Date().getDate() + 7)
            this.generateChatServerInvitation()
          else
            this.invitation = data.body!
        },
        (error) => {
          this.generateChatServerInvitation()
        }
      )
  }

  generateChatServerInvitation() {
    this._chatServerInvitationService.generateChatServerInvitation(this.data.serverId)
      .subscribe(
        (data: HttpResponse<ChatServerInvitation>) => {
          this.invitation = data.body!
        },
        (error) => {
          console.log('err')
        }
      )
  }
}
