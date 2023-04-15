import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'delete-server-confirm-dialog',
  templateUrl: './delete-server-confirm-dialog.component.html',
  styleUrls: ['./delete-server-confirm-dialog.component.css']
})
export class DeleteServerConfirmDialog implements OnInit {
  inputValue: string = ''
  isInvalid: boolean = false
  onDeleteEvent = new EventEmitter<void>()

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { serverName: string }
  ) { }

  ngOnInit() {
  }

  onValueChange(event: Event) {
    this.inputValue = (event.target as any).value
  }

  onDelete() {
    if (this.inputValue == this.data.serverName)
      this.onDeleteEvent.emit()
    else
      this.isInvalid = true
  }
}
