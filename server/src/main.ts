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
      store: new TypeormStore().connect(sessionRepository)
    })
  )

  const defaultOrigin = 'http://localhost:4200'
  const allowedOrigins = [
    process.env.CLIENT_ORIGIN_1 || defaultOrigin,
    process.env.CLIENT_ORIGIN_2 || defaultOrigin,
    process.env.CLIENT_ORIGIN_3 || defaultOrigin,
    process.env.CLIENT_ORIGIN_4 || defaultOrigin,
  ]
  
  app.enableCors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
  app.use(passport.initialize())
  app.use(passport.session())
  await seedData(app.get(DataSource))
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
