import { Component, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'server-settings-snackbar',
  templateUrl: './server-settings-snackbar.component.html',
  styleUrls: ['./server-settings-snackbar.component.css']
})
export class ServerSettingsSnackbar implements OnInit {
  onResetEvent = new EventEmitter()
  onSaveEvent = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

  onReset() {
    this.onResetEvent.emit()
  }

  onSave() {
    this.onSaveEvent.emit()
  }
}
