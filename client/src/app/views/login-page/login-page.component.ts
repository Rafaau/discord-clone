import { Component, OnInit } from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition,
  state,
} from '@angular/animations'
import { 
  FormGroup, 
  FormControl, 
  Validators } from '@angular/forms';
import { AuthService } from 'src/app/_services/auth.service';
import { LoginUserParams, User } from 'src/app/_models/Users';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MyErrorStateMatcher } from 'src/app/utils/MyErrorStateMatcher';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  animations: [
    trigger('openClose', [
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
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({
        width: '12px',
        height: '24px',
        fontSize: '0px'
      })),
      state('expanded', style({
        width: '250px',
        height: '75px',
        fontSize: '16px'
      })),
      transition('expanded <=> collapsed', [
        animate('0.1s')
      ])
    ])
  ]
})
export class LoginPageComponent implements OnInit {
  profileForm = new FormGroup({
    email: new FormControl('', Validators.email),
    password: new FormControl('', Validators.required),
    rememberMe: new FormControl(false)
  })

  matcher = new MyErrorStateMatcher()

  isShown: boolean = true
  expanded: boolean = false

  protected unauthorizedResponse: boolean = false

  users: User[] = []

  constructor(
    private readonly _authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    //this.instantLogin()
  }

  async redirectToRegister() {
    this.isShown = false
    setTimeout(() => {
      this.router.navigate(['/register'])
    }, 100)
  }

  onSubmit() {
    this.unauthorizedResponse = false
    const credentials: LoginUserParams = {
      username: this.profileForm.value.email!,
      password: this.profileForm.value.password!,
      rememberMe: this.profileForm.value.rememberMe!
    }
    this._authService.authorizeUser(credentials).subscribe(
      (data: HttpResponse<{}>) => {
        this.router.navigate([''])
          .then(() => {
            this.router.navigate([{ outlets: { main: 'friends', secondary: 'directmessages' } }])
          })
      },
      (error) => {
        console.log("invalid credentials")
        this.unauthorizedResponse = true
      }) 
  }

  instantLogin() {
    const credentials: LoginUserParams = {
      username: 'rafau@gmail.com',
      password: 'password'
    }
    this._authService.authorizeUser(credentials).subscribe(
      (data: HttpResponse<{}>) => {
        this.router.navigate([''])
      },
      (error) => {
        console.log("invalid credentials")
        this.unauthorizedResponse = true
      }) 
  }
}
