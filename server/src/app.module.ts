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
import { ChatCategoriesModule } from './chat-categories/chat-categories.module';
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

@Module({
  imports: [
    UsersModule,
    ChatServerModule,
    ChatCategoriesModule,
    ChatChannelsModule,
    ChatMessagesModule,
    DirectConversationModule,
    DirectMessagesModule,
    ChatServerInvitationsModule,
    MessageReactionsModule,
    NotificationsModule,
    AuthModule,
    MulterModule.register({
      dest: '../uploads/chat-server-avatars'
    }),
    MulterModule.register({
      dest: '../uploads/user-avatars'
    }), 
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'mysqlpw',
      database: 'chatapp_db',
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
