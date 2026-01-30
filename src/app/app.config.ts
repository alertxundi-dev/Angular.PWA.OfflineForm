import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

// Forzar SW en desarrollo para testing (comentar/descomentar según necesites)
const FORCE_SW_IN_DEV = false;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode() || FORCE_SW_IN_DEV,
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
