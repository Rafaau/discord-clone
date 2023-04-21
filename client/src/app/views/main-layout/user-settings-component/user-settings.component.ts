import { animate, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UpdateUserParams, User } from 'src/app/_models/user';
import { UsersService } from 'src/app/_services/users.service';
import { ChangePasswordDialog } from './change-password-dialog/change-password-dialog.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { ServerSettingsSnackbar } from '../../chat-channels-component/chat-server-settings/server-settings-snackbar/server-settings-snackbar.component';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';

@Component({
  selector: 'user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: [
    './user-settings.component.css',
    '../../chat-channels-component/chat-server-settings/chat-server-settings.component.scss'
  ],
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
    ]),
    trigger('onMartToggle', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(50px)'
        }),
        animate('0.2s cubic-bezier(0.35, 0, 0.25, 1.75)',
          style({
            opacity: 1,
            transform: 'translateY(*)'
          }))
      ]),
      transition(':leave',
        animate('0.1s',
          style({
            opacity: 0,
            transform: 'translateY(-50px)'
          })))
    ])
  ]
})
export class UserSettingsComponent implements OnInit, OnChanges {
  @Input()
  user?: User
  @Output()
  public onClose = new EventEmitter()
  @Output()
  public onUserUpdate = new EventEmitter<User>
  isOpen: boolean = true
  public View = View
  currentView: View = View.MyAccount
  public Form = Form
  currentForm: Form = Form.None
  userDetailsForm?: FormGroup
  userPassword?: string
  aboutMeValue?: string
  showEmojiPicker: boolean = false
  martToggle: boolean = false
  inputSensitivity?: number
  messageBadgeOption?: boolean
  inputElement = () => document.querySelector('.details-input') as HTMLTextAreaElement
  textareaElement = () => document.querySelector('.about-me-input') as HTMLTextAreaElement

  constructor(
    private readonly _usersService: UsersService,
    private readonly _authService: AuthService,
    private readonly _sharedDataProvider: SharedDataProvider,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
  }

  logout() {
    localStorage.removeItem('jwt_token')
    this.router.navigate(['']).then(() => {
      this.router.navigate(['login'])
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.user && !this.userDetailsForm) {
      this.initForm()
    }
  }

  onCloseClick() {
    this.isOpen = false
    setTimeout(() => {
      this.onClose.emit()
    }, 50)
  }

  initForm() {
    this.userDetailsForm = new FormGroup({
      email: new FormControl(this.user?.email, Validators.email),
      username: new FormControl(this.user?.username, Validators.required),
      phoneNumber: new FormControl(
        this.user?.phoneNumber ? this.user?.phoneNumber : '', 
        Validators.pattern(/[0-9\+\-\ ]/)
      )
    })
    this.aboutMeValue = this.user?.aboutMe ? this.user.aboutMe : ''
    this.inputSensitivity = 50 - this.user!.appSettings.inputSensitivity
    this.messageBadgeOption = this.user!.appSettings.messageBadge
  }

  saveUserDetails() {
    const reqBody: UpdateUserParams = {
      username: this.userDetailsForm!.controls['username'].value,
      email: this.userDetailsForm!.controls['email'].value,
      phoneNumber: this.userDetailsForm!.controls['phoneNumber'].value,
      password: this.userPassword,
      aboutMe: this.aboutMeValue,
      appSettings: {
        inputSensitivity: 50 - this.inputSensitivity!,
        messageBadge: this.messageBadgeOption!
      }
    }
    this._usersService.updateUser(this.user!.id, reqBody)
      .subscribe(
        (data: HttpResponse<any>) => {
          this.user = data.body
          this.onUserUpdate.emit(data.body)
          this._sharedDataProvider.setCurrentUser(data.body)
        }
      )
    this.currentForm = Form.None
    setTimeout(() => {
      this.initForm()
    }, 500)
  }

  editUsername() {
    this.currentForm = Form.Username
    setTimeout(() => {
      this.inputElement().focus()
    }, 100)
  }

  editEmail() {
    this.currentForm = Form.Email
    setTimeout(() => {
      this.inputElement().focus()
    }, 100)
  }

  editPhoneNumber() {
    this.currentForm = Form.PhoneNumber
    setTimeout(() => {
      this.inputElement().focus()
    }, 100)
  }

  openPasswordDialog() {
    let dialogRef = this.dialog.open(ChangePasswordDialog, {
      data: { oldPassword: this.user!.password, userId: this.user!.id },
      width: '450px',
      panelClass: 'dialog-container'
    })
    const sub = dialogRef.componentInstance.onChangePassword.subscribe((newPassword: string) => {
      this.userPassword = newPassword
      this.saveUserDetails()
      this.dialog.closeAll()
    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })
  }

  onFileChange(event: Event) {
    const file: File = (event.target as any).files[0]
    this._usersService.uploadAvatar(this.user!.id, file)
      .subscribe((response: HttpResponse<any>) => {
        // TODO
      })
  }

  onAboutMeChange(event: Event) {
    const value = (event.target as any).value
    this.aboutMeValue = value
    if (value != this.user?.aboutMe) {
      this.openSnackbar()
    }
  }

  onInputSensitivityChange(event: Event) {
    const value = (event.target as any).value
    this.inputSensitivity = value
    if (value != this.user?.appSettings.inputSensitivity) {
      this.openSnackbar()
    }
  }

  onMessageBadgeChange() {
    this.messageBadgeOption = !this.messageBadgeOption
    this.openSnackbar()
  }

  openSnackbar() {
    if (!this.snackbar._openedSnackBarRef) {
      let snackBarRef = this.snackbar.openFromComponent(
        ServerSettingsSnackbar
      )

      const resetSub = snackBarRef.instance.onResetEvent.subscribe(() => {
        this.aboutMeValue = this.user?.aboutMe ? this.user.aboutMe : ''
        this.inputSensitivity = 50 - this.user!.appSettings.inputSensitivity
        this.messageBadgeOption = this.user!.appSettings.messageBadge
        this.snackbar.dismiss()
      })
      snackBarRef.afterDismissed().subscribe(() => resetSub.unsubscribe())

      const saveSub = snackBarRef.instance.onSaveEvent.subscribe(() => {
        if (this.aboutMeValue!.length <= 130) {
          this.saveUserDetails()
          this.snackbar.dismiss()
        }
      })
      snackBarRef.afterDismissed().subscribe(() => saveSub.unsubscribe())
    }
  }

  toggleEmojiPicker() {
    this.martToggle = false
    this.showEmojiPicker = !this.showEmojiPicker
    setTimeout(() => {
      this.martToggle = true
    }, 500)
  }

  closeEmojiPicker(event: Event) {
    if (this.martToggle) {
      this.showEmojiPicker = false
      this.martToggle = false
    }
  }

  addEmojiToMessage(event: Event) {
    this.aboutMeValue += (event as any).emoji.native
    this.showEmojiPicker = false
    this.textareaElement().focus()
    this.openSnackbar()
  }

}

export enum View {
  MyAccount = 'My Account',
  Profiles = 'Profiles',
  VoiceAndVideo = 'Voice & Video',
  Notifications = 'Notifications',
}

export enum Form {
  None,
  Username,
  Email,
  PhoneNumber,
  Password
}
