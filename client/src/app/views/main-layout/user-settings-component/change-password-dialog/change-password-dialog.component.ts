import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyErrorStateMatcher } from 'src/app/utils/MyErrorStateMatcher';
import { UsersService } from 'src/app/_services/users.service';

@Component({
  selector: 'change-password',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.css']
})
export class ChangePasswordDialog implements OnInit {
  @Output()
  onChangePassword = new EventEmitter<string>
  passwordForm = new FormGroup({
    oldPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', Validators.required),
    confirmNewPassword: new FormControl('', Validators.required)
  })

  matcher = new MyErrorStateMatcher()

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { oldPassword: string, userId: number },
    private readonly _usersService: UsersService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  async onSubmit() {
    if (this.passwordForm.valid) {
      this._usersService.checkIfPasswordDoesMatch(
        this.data.userId, 
        this.passwordForm.controls['oldPassword'].value!
      ).subscribe((response: HttpResponse<any>) => { 
        if (!response.body) {
          this.passwordForm.controls['oldPassword'].setErrors({ doesNotMatch: true })
          return
        }
      })
      if (this.passwordForm.controls['newPassword'].value != this.passwordForm.controls['confirmNewPassword'].value) {
        this.passwordForm.controls['confirmNewPassword'].setErrors({ doesNotMatch: true })
        return
      }
      this.onChangePassword.emit(this.passwordForm.controls['newPassword'].value!)
      this.dialog.closeAll()
    } else {
      this.passwordForm.markAllAsTouched()
    }
  }
}
