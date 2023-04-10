import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport'
import { TypeormStore } from 'connect-typeorm';
import { SessionEntity } from './typeorm/session';
import { DataSource } from 'typeorm';
import { seedData } from './seeds/seed';
import { TypeOrmModule } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  const sessionRepository = app.get(DataSource).getRepository(SessionEntity)
  app.use(
    session({
      name: 'NESTJS_SESSION_ID',
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 36000000,
        sameSite: process.env.NODE_ENV === 'test' ? 'lax' : 'none',
        secure: true
      },
      store: new TypeormStore().connect(sessionRepository)
    })
  )
  app.enableCors({
    origin: '*', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
  app.use(passport.initialize({
    userProperty: 'user'
  }))
  app.use(passport.session())
  await seedData(app.get(DataSource))
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
