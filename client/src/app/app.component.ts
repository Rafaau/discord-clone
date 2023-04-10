import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiHelpers } from './_services/helpers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor (public router: Router) {
    this.loadTokenFromLocalStorage()
  }

  ngOnInit() { }

  title = 'client';

  private loadTokenFromLocalStorage() {
    const token = localStorage.getItem('jwt_token')
    if (token) {
      ApiHelpers.updateAuthorizationHeader(token)
    }
  }
}
