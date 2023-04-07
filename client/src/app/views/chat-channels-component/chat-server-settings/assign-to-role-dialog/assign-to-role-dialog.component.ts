import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'assign-to-role-dialog',
  templateUrl: './assign-to-role-dialog.component.html',
  styleUrls: ['./assign-to-role-dialog.component.css']
})
export class AssignToRoleDialog implements OnInit {
  onAddEvent = new EventEmitter()
  membersToAdd: number[] = []

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { members: User[], role: string }
  ) { }

  ngOnInit() {
  }

  addOrRemoveFromList(user: User) {
    if (this.membersToAdd.includes(user.id)) {
      this.membersToAdd = this.membersToAdd.filter(x => x != user.id)
    } else {
      this.membersToAdd.push(user.id)
    }
  }

  onAdd() {
    this.onAddEvent.emit(this.membersToAdd)
  }
}
