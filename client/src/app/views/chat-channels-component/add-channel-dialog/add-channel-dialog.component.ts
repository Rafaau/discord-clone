import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyErrorStateMatcher } from 'src/app/utils/MyErrorStateMatcher';
import { ChannelType, CreateChatChannelParams } from 'src/app/_models/chat-channels';
import { User } from 'src/app/_models/user';
import { ChatChannelService } from 'src/app/_services/chat-channel.service';

@Component({
  selector: 'add-channel-dialog',
  templateUrl: './add-channel-dialog.component.html',
  styleUrls: ['./add-channel-dialog.component.css']
})
export class AddChannelDialog {
  channelType = ChannelType
  channelForm = new FormGroup({
    name: new FormControl('', Validators.required),
    isPrivate: new FormControl(false),
    type: new FormControl(this.channelType.Text)
  })

  matcher = new MyErrorStateMatcher()
  onCreate = new EventEmitter()

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { 
      categoryId: number, 
      categoryName: string, 
      currentUser: User 
    },
    public dialog: MatDialog,
    private readonly _chatChannelService: ChatChannelService
  ) { }

  onSubmit() {
    if (this.channelForm.valid) {
      const isPrivate = this.channelForm.value.isPrivate!
      const reqBody: CreateChatChannelParams = {
        name: this.channelForm.value.name!,
        type: this.channelForm.value.type!,
        isPrivate: isPrivate,
        users: isPrivate ? [this.data.currentUser] : [],
        roles: []
      }
      this._chatChannelService.createChatChannel(this.data.categoryId, reqBody)
      this.onCreate.emit()
      this.dialog.closeAll()
    }
  }
}
