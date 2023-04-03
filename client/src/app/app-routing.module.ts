import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ChatChannelsComponent } from './views/chat-channels-component/chat-channels.component';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { RegisterPageComponent } from './views/register-page/register-page.component';
import { ChatMessagesComponent } from './views/chat-messages-component/chat-messages.component';
import { DirectMessagesListComponent } from './views/direct-messages-list-component/direct-messages-list.component';
import { DirectMessagesComponent } from './views/direct-messages-component/direct-messages.component';
import { FriendsComponent } from './views/friends-component/friends.component';
import { MainLayoutComponent } from './views/main-layout/main-layout.component';

const routes: Routes = [
  { path: '', 
    component: MainLayoutComponent,
    children: [
      {
        path: 'chatserver/:serverId',
        component: ChatChannelsComponent,
        outlet: 'secondary',
        children: [
          {
            path: 'channel/:channelId',
            component: ChatMessagesComponent,
            outlet: 'main'
          },
        ],
      },
      {
        path: 'directmessages',
        component: DirectMessagesListComponent,
        outlet: 'secondary',
        children: [
          {
            path: '',
            component: FriendsComponent,
            outlet: 'main'
          },
          {
            path: 'conversation/:conversationId',
            component: DirectMessagesComponent,
            outlet: 'main'
          },
        ],
      },
      {
        path: 'channel/:channelId',
        component: ChatMessagesComponent,
        outlet: 'main'
      },
      {
        path: 'friends',
        component: FriendsComponent,
        outlet: 'main'
      },
      {
        path: 'conversation/:conversationId',
        component: DirectMessagesComponent,
        outlet: 'main'
      },
    ] 
  },
  { path: 'login', component: LoginPageComponent, pathMatch: 'full' },
  { path: 'register', component: RegisterPageComponent, pathMatch: 'full' },
  { path: 'invitation', component: AppComponent },
]

const routerOptions: ExtraOptions = {
  initialNavigation: 'enabledBlocking',
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
}

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
