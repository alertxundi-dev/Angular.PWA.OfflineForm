import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco, TRANSLOCO_LOADER } from '@jsverse/transloco';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslocoHttpLoader } from './features/i18n/loaders/transloco-loader';
import { AvailableLangs } from './features/i18n/config/transloco.config';
import { AvailableLanguages } from './features/i18n/config/transloco.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideTransloco({
      config: {
        availableLangs: AvailableLanguages,
        defaultLang: AvailableLangs.ES,
        reRenderOnLangChange: true,
        prodMode: !isDevMode()
      },
      loader: TranslocoHttpLoader
    })
  ]
};
