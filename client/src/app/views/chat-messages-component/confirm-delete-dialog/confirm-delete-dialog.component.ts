import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatMessage } from 'src/app/_models/chat-message';
import { DirectMessage } from 'src/app/_models/direct-message';
import { ChatMessagesService } from 'src/app/_services/chat-messages.service';
import { DirectMessageService } from 'src/app/_services/direct-message.service';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.css']
})
export class ConfirmDeleteDialog implements OnInit {
  onDeleteEvent = new EventEmitter()

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { message: ChatMessage | DirectMessage },
    public dialog: MatDialog,
    private readonly _chatMessagesService: ChatMessagesService,
    private readonly _directMessageService: DirectMessageService
  ) { }

  ngOnInit() {
  }

  isTypeOfChatMessage(message: ChatMessage | DirectMessage): message is ChatMessage {
    return (message as ChatMessage).chatChannel !== undefined
  }

  onDelete() {
    if (this.isTypeOfChatMessage(this.data.message)) {
      this._chatMessagesService.deleteChatMessage(this.data.message.id)
        .subscribe(
          (data: HttpResponse<{}>) => {
            this.onDeleteEvent.emit()
            this.dialog.closeAll()
          },
          (error) => {
            console.log('err')
          }
        )
    } else {
      this._directMessageService.deleteDirectMessage(this.data.message.id)
        .subscribe(
          (data: HttpResponse<{}>) => {
            this.onDeleteEvent.emit()
            this.dialog.closeAll()
          },
          (error) => {
            console.log('err')
          }
        )
    }
  }

  isToday(date: Date) {
    return new Date(date).getDate() == new Date().getDate()
  }

  isYesterday(date: Date) {
    return new Date(date).getDate() == (new Date().getDate())-1
  }

  toDate(date: Date) {
    return new Date(date).getDate()
  }

  isLongAgo(date: Date) {
    return new Date(date).getDate() < (new Date().getDate())-1
  }
}
