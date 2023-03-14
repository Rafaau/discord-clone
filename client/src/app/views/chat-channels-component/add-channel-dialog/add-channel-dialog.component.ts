import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyErrorStateMatcher } from 'src/app/utils/MyErrorStateMatcher';
import { CreateChatChannelParams } from 'src/app/_models/chat-channels';
import { ChatChannelService } from 'src/app/_services/chat-channel.service';

@Component({
  selector: 'add-channel-dialog',
  templateUrl: './add-channel-dialog.component.html',
  styleUrls: ['./add-channel-dialog.component.css']
})
export class AddChannelDialog {
  channelForm = new FormGroup({
    name: new FormControl('', Validators.required)
  })

  matcher = new MyErrorStateMatcher()
  onCreate = new EventEmitter()

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { categoryId: number, categoryName: string },
    public dialog: MatDialog,
    private readonly _chatChannelService: ChatChannelService
  ) { }

  onSubmit() {
    if (this.channelForm.valid) {
      const reqBody: CreateChatChannelParams = {
        name: this.channelForm.value.name!
      }
      this._chatChannelService
        .createChatChannel(this.data.categoryId, reqBody)
        .subscribe(
          (data: HttpResponse<{}>) => {
            this.onCreate.emit()
            this.dialog.closeAll()
          },
          (error) => {
            console.log('err')
          }
        )
    }
  }
}
