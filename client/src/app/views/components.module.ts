import { NgModule } from '@angular/core';

import { MainLayoutComponent } from './main-layout/main-layout.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { ChatServersComponent } from './chat-servers-component/chat-servers.component';
import { ChatChannelsComponent } from './chat-channels-component/chat-channels.component';
import { ChatMessagesComponent } from './chat-messages-component/chat-messages.component';
import { DirectMessagesListComponent } from './direct-messages-list-component/direct-messages-list.component';
import { DirectMessagesComponent } from './direct-messages-component/direct-messages.component';
import { FriendsComponent } from './friends-component/friends.component';
import { VarDirective } from '../_directives/ngVar.directive';
import { AddServerDialog } from './chat-servers-component/add-server-dialog/add-server-dialog.component';
import { AddChannelDialog } from './chat-channels-component/add-channel-dialog/add-channel-dialog.component';
import { AddCategoryDialog } from './chat-channels-component/add-category-dialog/add-category-dialog.component';
import { ConfirmDeleteDialog } from './chat-messages-component/confirm-delete-dialog/confirm-delete-dialog.component';
import { GenerateInvitationDialog } from './chat-channels-component/generate-invitation-dialog/generate-invitation.component';
import { UserDetailsComponent } from './user-details-component/user-details.component';
import { ChatServerSettingsComponent } from './chat-channels-component/chat-server-settings/chat-server-settings.component';
import { UserSettingsComponent } from './main-layout/user-settings-component/user-settings.component';
import { ChangePasswordDialog } from './main-layout/user-settings-component/change-password-dialog/change-password-dialog.component';
import { MessageContentComponent } from './chat-messages-component/message-content-component/message-content.component';
import { MessageReactionsComponent } from './chat-messages-component/message-reactions-component/message-reactions.component';
import { UserAvatarComponent } from './main-layout/user-avatar-component/user-avatar.component';
import { ChatServerAvatarComponent } from './main-layout/chat-server-avatar-component/chat-server-avatar.component';
import { AssignToRoleDialog } from './chat-channels-component/chat-server-settings/assign-to-role-dialog/assign-to-role-dialog.component';
import { ChannelPermissionsDialog } from './chat-channels-component/channel-permissions-dialog/channel-permissions.component';
import { RemoveConfirmDialog } from './friends-component/remove-confirm-dialog/remove-confirm-dialog.component';
import { DeleteServerConfirmDialog } from './chat-channels-component/chat-server-settings/delete-server-confirm-dialog/delete-server-confirm-dialog.component';
import { VoicePanelComponent } from './main-layout/voice-panel/voice-panel.component';
import { MembersListComponent } from './chat-servers-component/members-list-component/members-list.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ClickOutsideModule } from 'ng-click-outside';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SocketIoModule } from 'ngx-socket-io';
import { NgxYoutubePlayerModule } from 'ngx-youtube-player';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
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
    MessageReactionsComponent,
    UserAvatarComponent,
    ChatServerAvatarComponent,
    AssignToRoleDialog,
    ChannelPermissionsDialog,
    RemoveConfirmDialog,
    DeleteServerConfirmDialog,
    VoicePanelComponent,
    MembersListComponent
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
    BrowserAnimationsModule,
  ]
})
export class ComponentsModule { }
