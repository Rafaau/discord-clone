import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as dotenv from 'dotenv';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
