import { Component, OnInit, Inject, EventEmitter, ViewEncapsulation } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { 
  animate, 
  style, 
  transition, 
  trigger } from '@angular/animations';
import { MyErrorStateMatcher } from 'src/app/utils/MyErrorStateMatcher';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { CreateChatServerParams } from 'src/app/_models/chat-servers';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'add-server-dialog',
  templateUrl: './add-server-dialog.component.html',
  styleUrls: ['./add-server-dialog.component.css'],
  animations: [
    trigger('changeView', [
      transition(':leave', [
        animate('0s', 
          style({ 
            position: 'absolute'
        })),
        animate('0.2s ease',
          style({
            transform: 'translateX(-100%)'
        }))
      ]),
      transition(':enter', [
        style({
          transform: 'translateX(-100%)'
        }),
        animate('0.25s ease',
          style({
            transform: 'translateX(*)'
        }))
      ])
    ]),
    trigger('otherView', [
      transition(':enter', [
        style({
          transform: 'translateX(100%)'
        }),
        animate('0.25s ease', 
          style({
            transform: 'translateX(*)'
        }))
      ]),
      transition(':leave', [
        animate('0s', 
          style({
            position: 'absolute',
            top: '0'
        })),
        animate('0.2s ease',
          style({
            transform: 'translateX(100%)'
        }))
      ])
    ])
  ]
})
export class AddServerDialog {
  chatServerForm = new FormGroup({
    name: new FormControl('', Validators.required)
  })

  matcher = new MyErrorStateMatcher()
  createView: boolean = false
  onCreate = new EventEmitter()

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { name: string },
    private readonly _chatServerService: ChatServerService,
    public dialog: MatDialog
  ) { }

  
  toMainView() {
    this.createView = false
  }

  toCreateView() {
    this.createView = true
  }

  onSubmit() {
    if (this.chatServerForm.valid) {
      const reqBody: CreateChatServerParams = {
        name: this.chatServerForm.value.name!
      }
      this._chatServerService.createChatServer(reqBody, 1).subscribe(
        (data: HttpResponse<{}>) => {
          this.onCreate.emit()
          this.dialog.closeAll()
        },
        (error) => {
          console.log("err")
        }
      )
    } else {
      this.chatServerForm.controls.name.setErrors({ 'incorrect': true })
      this.chatServerForm.markAllAsTouched()
    }
  }
}
