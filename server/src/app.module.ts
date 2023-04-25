import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatChannelsModule } from './modules/chat-channels/chat-channels.module';
import { ChatMessagesModule } from './modules/chat-messages/chat-messages.module';
import { ChatServerModule } from './modules/chat-servers/chat-servers.module';
import { ChatChannel } from './entities/chat-channel';
import { ChatMessage } from './entities/chat-message';
import { ChatServer } from './entities/chat-server';
import { User } from './entities/user';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { SessionEntity } from './entities/session';
import { ChatCategory } from './entities/chat-category';
import { DirectConversation } from './entities/direct-conversation';
import { DirectMessage } from './entities/direct-message';
import { DirectConversationModule } from './modules/direct-conversations/direct-conversations.module';
import { DirectMessagesModule } from './modules/direct-messages/direct-messages.module';
import { ChatServerInvitation } from './entities/chat-server-invitation';
import { ChatServerInvitationsModule } from './modules/chat-server-invitations/chat-server-invitations.module';
import { MessageReaction } from './entities/message-reaction';
import { MessageReactionsModule } from './modules/message-reactions/message-reactions.module';
import { Notification } from './entities/notification';
import { NotificationsModule } from './modules/notifications/notifications.module'
import { MulterModule } from '@nestjs/platform-express';
import { Role } from './entities/role';
import { RolesModule } from './modules/roles/roles.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from 'config/configuration';
import { FriendRequest } from './entities/friend-request';
import { FriendRequestsModule } from './modules/friend-requests/friend-requests.module';
import { SignallingModuleGateway } from './modules/signalling-gateway/signalling.module';
import { AppSettings } from './entities/app-settings';

@Module({
  imports: [
    ConfigModule.forRoot({  
      envFilePath: `config/${process.env.NODE_ENV.trim()}.env`,
      load: [configuration]
    }),
    UsersModule,
    ChatServerModule,
    ChatChannelsModule,
    ChatMessagesModule,
    DirectConversationModule,
    DirectMessagesModule,
    ChatServerInvitationsModule,
    MessageReactionsModule,
    NotificationsModule,
    RolesModule,
    FriendRequestsModule,
    AuthModule,
    SignallingModuleGateway,
    MulterModule.register({
      dest: '../uploads/chat-server-avatars'
    }),
    MulterModule.register({
      dest: '../uploads/user-avatars'
    }), 
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      entities: [
        User, 
        ChatServer,
        ChatCategory,
        ChatChannel,
        ChatMessage,
        DirectConversation,
        DirectMessage,
        ChatServerInvitation,
        MessageReaction,
        Notification,
        Role,
        FriendRequest,
        AppSettings,
        SessionEntity
      ],
      synchronize: true,
    }),
    AuthModule,
    PassportModule.register({
      session: true
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
