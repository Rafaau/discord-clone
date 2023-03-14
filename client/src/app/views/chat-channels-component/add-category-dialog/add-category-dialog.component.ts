import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyErrorStateMatcher } from 'src/app/utils/MyErrorStateMatcher';
import { CreateChatCategoryParams } from 'src/app/_models/chat-category';
import { ChatChannelService } from 'src/app/_services/chat-channel.service';

@Component({
  selector: 'app-add-category-dialog',
  templateUrl: './add-category-dialog.component.html',
  styleUrls: ['./add-category-dialog.component.css']
})
export class AddCategoryDialog {
  categoryForm = new FormGroup({
    name: new FormControl('', Validators.required)
  })

  matcher = new MyErrorStateMatcher()
  onCreate = new EventEmitter()

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { serverId: number },
    public dialog: MatDialog,
    private readonly _chatChannelService: ChatChannelService
  ) { }
  
    onSubmit() {
      const reqBody: CreateChatCategoryParams = {
        name: this.categoryForm.value.name!
      }
      this._chatChannelService.createChatCategory(this.data.serverId, reqBody)
        .subscribe(
          (data: HttpResponse<{}>) => {
            this.onCreate.emit()
            this.dialog.closeAll()
          }
        )
    }
}
