import {
  ApplicationConfig,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData as registerLocaleDataCommon } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { authInterceptor } from './interceptor/auth.interceptor';
import { authErrorInterceptor } from './interceptor/auth-error.interceptor';

// Registra locale PT-BR para pipes de data/moeda/decimal
registerLocaleDataCommon(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, authErrorInterceptor])
    ),
    provideNgxMask(),
    { provide: LOCALE_ID, useValue: 'pt' },
  ],
};
