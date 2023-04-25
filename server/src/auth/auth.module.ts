import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user';
import { UsersService } from 'src/modules/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './utils/local-strategy';
import { SessionSerializer } from './utils/session-serializer';
import { AuthGateway } from './gateway/auth.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './utils/constants';
import { AppSettings } from 'src/entities/app-settings';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AppSettings
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' }
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService
    },
    {
      provide: 'USER_SERVICE',
      useClass: UsersService
    },
    {
      provide: 'AUTH_GATEWAY',
      useClass: AuthGateway
    },
    LocalStrategy,
    SessionSerializer
  ]
})
export class AuthModule {}
