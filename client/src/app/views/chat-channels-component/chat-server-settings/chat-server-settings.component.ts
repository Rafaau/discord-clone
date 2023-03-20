import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatServer } from 'src/app/_models/chat-servers';

@Component({
  selector: 'chat-server-settings',
  templateUrl: './chat-server-settings.component.html',
  styleUrls: ['./chat-server-settings.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale(1.2)',
          filter: 'blur(4px)'
        }),
        animate('0.2s ease-in',
          style({
            opacity: 1,
            transform: 'scale(*)'
          }))
      ]),
      transition(':leave', [
        animate('0.2s ease-out', 
          style({
            opacity: 0,
            transform: 'scale(1.2)',
            filter: 'blur(4px)'
          }))
      ])
    ])
  ]
})
export class ChatServerSettingsComponent implements OnInit {
  @Input()
  chatServer?: ChatServer
  @Output()
  public onClose = new EventEmitter()
  isOpen: boolean = true

  constructor() { }

  ngOnInit() {
  }

  onCloseClick() {
    this.isOpen = false
    setTimeout(() => {
      this.onClose.emit()
    }, 50)
  }
}
