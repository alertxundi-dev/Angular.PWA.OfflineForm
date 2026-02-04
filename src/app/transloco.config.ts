import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';
export enum AvailableLangs {
  ES = 'es',
  EN = 'en',
  PT = 'pt'
}

export const AvailableLanguages = [
  AvailableLangs.ES,
  AvailableLangs.EN,
  AvailableLangs.PT
]
export const config: TranslocoGlobalConfig = {
  langs: AvailableLanguages,
  defaultLang: AvailableLangs.ES,
  rootTranslationsPath: './src/assets/i18n'
};

export default config;
