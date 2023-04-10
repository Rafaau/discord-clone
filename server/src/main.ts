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

  app.enableCors({
    origin: '*', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
  app.use(passport.initialize())
  app.use(passport.session())
  await seedData(app.get(DataSource))
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
