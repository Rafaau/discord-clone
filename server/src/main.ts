import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport'
import { TypeormStore } from 'connect-typeorm';
import { SessionEntity } from './typeorm/session';
import { Connection, DataSource, getConnection, getConnectionManager } from 'typeorm';
import { seedData } from './seeds/seed';
import { TypeOrmModule } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.setGlobalPrefix('api')
  const sessionRepository = app.get(DataSource).getRepository(SessionEntity)
  app.use(
    session({
      name: 'NESTJS_SESSION_ID',
      secret: 'DKOGNUGYWFGYFCMKSOXMNVC',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 36000000,
      },
      store: new TypeormStore().connect(sessionRepository)
    })
  )
  app.enableCors({
    origin:'http://localhost:4200', 
    credentials: true
  })
  app.use(passport.initialize())
  app.use(passport.session())
  await seedData(app.get(DataSource))
  await app.listen(3000);
}
bootstrap();
