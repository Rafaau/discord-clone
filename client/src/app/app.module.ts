import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { MainLayoutComponent } from './views/main-layout/main-layout.component';
import { LayoutModule } from '@angular/cdk/layout'
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './_services/auth.service';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { RegisterPageComponent } from './views/register-page/register-page.component';
import { ChatServersComponent } from './views/chat-servers-component/chat-servers.component';
import { AddServerDialog } from './views/chat-servers-component/add-server-dialog/add-server-dialog.component';
import { ChatChannelsComponent } from './views/chat-channels-component/chat-channels.component';
import { AddChannelDialog } from './views/chat-channels-component/add-channel-dialog/add-channel-dialog.component';
import { ChatMessagesComponent } from './views/chat-messages-component/chat-messages.component';
import { VarDirective } from './_directives/ngVar.directive';
import { DirectMessagesListComponent } from './views/direct-messages-list-component/direct-messages-list.component';
import { FriendsComponent } from './views/friends-component/friends.component';
import { DirectMessagesComponent } from './views/direct-messages-component/direct-messages.component';
import { ConfirmDeleteDialog } from './views/chat-messages-component/confirm-delete-dialog/confirm-delete-dialog.component';
import { UserDetailsComponent } from './views/user-details-component/user-details.component';
import { ClickOutsideModule } from 'ng-click-outside';
import { AddCategoryDialog } from './views/chat-channels-component/add-category-dialog/add-category-dialog.component';
import { ChatServerSettingsComponent } from './views/chat-channels-component/chat-server-settings/chat-server-settings.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MessageContentComponent } from './views/chat-messages-component/message-content-component/message-content.component';
import { NgxYoutubePlayerModule } from 'ngx-youtube-player';
import { GenerateInvitationDialog } from './views/chat-channels-component/generate-invitation-dialog/generate-invitation.component';
import { ClipboardModule } from '@angular/cdk/clipboard'
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { MessageReactionsComponent } from './views/chat-messages-component/message-reactions-component/message-reactions.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserSettingsComponent } from './views/main-layout/user-settings-component/user-settings.component';
import { ChangePasswordDialog } from './views/main-layout/user-settings-component/change-password-dialog/change-password-dialog.component';

const socketIoConfig: SocketIoConfig = { url: 'http://localhost:3000', options: {} }

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    LoginPageComponent,
    RegisterPageComponent,
    ChatServersComponent,
    ChatChannelsComponent,
    ChatMessagesComponent,
    DirectMessagesListComponent,
    DirectMessagesComponent,
    FriendsComponent,
    VarDirective,
    AddServerDialog,
    AddChannelDialog,
    AddCategoryDialog,
    ConfirmDeleteDialog,
    GenerateInvitationDialog,
    UserDetailsComponent,
    ChatServerSettingsComponent,
    UserSettingsComponent,
    ChangePasswordDialog,
    MessageContentComponent,
    MessageReactionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    ClickOutsideModule,
    PickerModule,
    EmojiModule,
    ClipboardModule,
    InfiniteScrollModule,
    NgxYoutubePlayerModule.forRoot(),
    SocketIoModule.forRoot(socketIoConfig),
    BrowserAnimationsModule,
  ],
  providers: [
    HttpClient,
    AuthService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
