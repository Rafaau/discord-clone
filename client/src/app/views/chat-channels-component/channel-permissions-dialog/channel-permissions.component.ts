import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatChannel } from 'src/app/_models/chat-channels';
import { Role } from 'src/app/_models/role';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'channel-permissions',
  templateUrl: './channel-permissions.component.html',
  styleUrls: ['./channel-permissions.component.css']
})
export class ChannelPermissionsDialog implements OnInit {
  isPrivate: boolean = false
  permittedUsers: User[] = []
  permittedRoles: Role[] = []

  onSaveEvent = new EventEmitter<any>

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { 
      channel: ChatChannel, 
      members: User[],
      roles: Role[],
      currentUser: User 
    },
    public dialog: MatDialog
  ) { 
    console.log(data.channel.users!)
    this.isPrivate = data.channel.isPrivate
    this.permittedRoles = data.channel.roles!
    this.permittedUsers = data.channel.users!
  }

  ngOnInit() {
  }

  changeIsPrivate() {
    if (this.isPrivate) 
      this.permittedUsers = []
    else
      this.permittedUsers.push(this.data.currentUser)
    this.isPrivate = !this.isPrivate
  }

  addOrRemoveFromUserList(user: User) {
    if (this.permittedUsers.includes(user)) {
      this.permittedUsers = this.permittedUsers.filter(x => x.id != user.id)
    } else {
      this.permittedUsers.push(user)
    }
  }

  addOrRemoveFromRoleList(role: Role) {
    if (this.permittedRoles.includes(role)) {
      this.permittedRoles = this.permittedRoles.filter(x => x.id != role.id)
    } else {
      this.permittedRoles.push(role)
    }
  }

  includesMember(id: number) {
    return this.permittedUsers.some(x => x.id == id)
  }

  includesRole(id: number) {
    return this.permittedRoles.some(x => x.id == id)
  }

  onSave() {
    this.onSaveEvent.emit({
      channelId: this.data.channel.id,
      isPrivate: this.isPrivate,
      permittedUsers: this.permittedUsers,
      permittedRoles: this.permittedRoles
    })
  }
}
