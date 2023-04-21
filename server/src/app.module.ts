import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatChannelsModule } from './chat-channels/chat-channels.module';
import { ChatMessagesModule } from './chat-messages/chat-messages.module';
import { ChatServerModule } from './chat-servers/chat-servers.module';
import { ChatChannel } from './typeorm/chat-channel';
import { ChatMessage } from './typeorm/chat-message';
import { ChatServer } from './typeorm/chat-server';
import { User } from './typeorm/user';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { SessionEntity } from './typeorm/session';
import { ChatCategory } from './typeorm/chat-category';
import { DirectConversation } from './typeorm/direct-conversation';
import { DirectMessage } from './typeorm/direct-message';
import { DirectConversationModule } from './direct-conversations/direct-conversations.module';
import { DirectMessagesModule } from './direct-messages/direct-messages.module';
import { ChatServerInvitation } from './typeorm/chat-server-invitation';
import { ChatServerInvitationsModule } from './chat-server-invitations/chat-server-invitations.module';
import { MessageReaction } from './typeorm/message-reaction';
import { MessageReactionsModule } from './message-reactions/message-reactions.module';
import { Notification } from './typeorm/notification';
import { NotificationsModule } from './notifications/notifications.module';
import { MulterModule } from '@nestjs/platform-express';
import { Role } from './typeorm/role';
import { RolesModule } from './roles/roles.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from 'config/configuration';
import { FriendRequest } from './typeorm/friend-request';
import { FriendRequestsModule } from './friend-requests/friend-requests.module';
import { SignallingModuleGateway } from './signalling-gateway/signalling.module';
import { AppSettings } from './typeorm/app-settings';

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
