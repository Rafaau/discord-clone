import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'chat-server-avatar',
  templateUrl: './chat-server-avatar.component.html',
  styleUrls: ['./chat-server-avatar.component.css']
})
export class ChatServerAvatarComponent implements OnInit, OnChanges {
  readonly api = environment.apiUrl+'/chatservers/getAvatar/chat-server-'

  @Input()
  serverId?: number
  @Input()
  name?: string
  doesExist?: boolean

  constructor(
    private readonly _chatServerService: ChatServerService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.doesExist == undefined) {
      this.checkIfAvatarExists()
    }
  }

  checkIfAvatarExists() {
    const img = new Image()
    img.src = `${this.api}${this.serverId}.jpeg`

    this.doesExist = img.complete
    img.onload = () => {
      this.doesExist = true
    }
  }
}
