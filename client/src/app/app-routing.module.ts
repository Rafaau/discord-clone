import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ChatChannelsComponent } from './views/chat-channels-component/chat-channels.component';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { RegisterPageComponent } from './views/register-page/register-page.component';

const routes: Routes = [
  { path: '', component: AppComponent, pathMatch:'full' },
  { path: 'login', component: LoginPageComponent, pathMatch:'full' },
  { path: 'register', component: RegisterPageComponent, pathMatch:'full' },
  { path: 'chatserver', component: AppComponent },
  { path: 'directmessages', component: AppComponent },
  { path: 'invitation', component: AppComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
