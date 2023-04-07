import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'remove-confirm-dialog',
  templateUrl: './remove-confirm-dialog.component.html',
  styleUrls: ['./remove-confirm-dialog.component.css']
})
export class RemoveConfirmDialog implements OnInit {
  onDeleteEvent = new EventEmitter()

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { friend: User },
  ) { }

  ngOnInit() {
  }

  onDelete() {
    this.onDeleteEvent.emit()
  }
}
