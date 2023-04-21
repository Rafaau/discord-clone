import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/user';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { LocalStrategy } from './utils/local-strategy';
import { SessionSerializer } from './utils/session-serializer';
import { AuthGateway } from './gateways/auth.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './utils/constants';
import { AppSettings } from 'src/typeorm/app-settings';

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
