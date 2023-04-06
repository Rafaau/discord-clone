import { Component, OnInit } from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations'
import { 
  FormGroup, 
  FormControl, 
  Validators } from '@angular/forms';
import { MyErrorStateMatcher } from 'src/app/utils/MyErrorStateMatcher';
import { Router } from '@angular/router';
import { CreateUserParams } from 'src/app/_models/Users';
import { AuthService } from 'src/app/_services/auth.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: [
    './register-page.component.css', 
    '../login-page/login-page.component.css'
  ],
  animations: [
    trigger('inOut', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-50px) scale(1.1)'
        }),
        animate('0.3s cubic-bezier(0.35, 0, 0.25, 1.75)',
          style({
            opacity: 1,
            transform: 'translateY(*) scale(*)'
        }))
      ]),
      transition(':leave', [
        animate('0.1s', 
          style({
            opacity: 0,
            transform: 'translateY(-50px) scale(1.1)'
        }))
      ])
    ])
  ]
})
export class RegisterPageComponent implements OnInit {
  registerForm = new FormGroup({
    email: new FormControl('', Validators.email),
    username: new FormControl(
      '', 
      Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zżźćńółęąśŻŹĆĄŚĘŁÓŃA-Z0-9_.-]*$') // polish letters allowed
      ])
    ),
    password: new FormControl(
      '', 
      Validators.compose([
        Validators.required,
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
      ])
    ),
    terms: new FormControl(false, Validators.required)
  })

  matcher = new MyErrorStateMatcher()
  isShown: boolean = true
  
  constructor(
    private readonly router: Router,
    private readonly _authService: AuthService
  ) { }

  ngOnInit() {
  }

  async redirectToLogIn() {
    this.isShown = false
    setTimeout(() => {
      this.router.navigate(['/login'])
    }, 100)
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const reqBody: CreateUserParams = {
        username: this.registerForm.value.username!,
        email: this.registerForm.value.email!,
        password: this.registerForm.value.password!
      }
      this._authService.registerAccount(reqBody).subscribe(
        (data: HttpResponse<{}>) => {
          if(data.ok)
            this.router.navigate(['/login'])
        },
        (error) => {
          console.log('err')
        } 
      )
    }
  }
}
