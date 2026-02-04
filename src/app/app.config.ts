import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco, TRANSLOCO_LOADER } from '@jsverse/transloco';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslocoHttpLoader } from './transloco-loader';
import { AvailableLangs } from './transloco.config';
import { AvailableLanguages } from './transloco.config';

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
    })]
};
