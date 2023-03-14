import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  shouldRenderLayout: boolean = !(
    window.location.pathname === '/login' ||
    window.location.pathname === '/register'
  )

  constructor (public router: Router) {}

  ngOnInit() {
    console.log(window.location.pathname)
  }

  title = 'client';
}
