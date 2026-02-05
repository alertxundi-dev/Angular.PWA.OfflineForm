import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';

export enum AvailableLangs {
  ES = 'es',
  EN = 'en',
  PT = 'pt',
  FR = 'fr'
}

export const AvailableLanguages = [
  AvailableLangs.ES,
  AvailableLangs.EN,
  AvailableLangs.PT,
  AvailableLangs.FR
];

// 🎯 Mapeo dinámico de idiomas - fácil de extender
export const LanguageConfig = {
  [AvailableLangs.ES]: { name: 'Español', flag: '🇪🇸' },
  [AvailableLangs.EN]: { name: 'English', flag: '🇬🇧' },
  [AvailableLangs.PT]: { name: 'Português', flag: '🇵🇹' },
  [AvailableLangs.FR]: { name: 'Français', flag: '🇫🇷' }
} as const;

// 🎯 Función para obtener la configuración de idiomas dinámicamente
export function getAvailableLanguages(): Array<{ code: AvailableLangs; name: string; flag: string }> {
  return AvailableLanguages.map(code => ({
    code,
    name: LanguageConfig[code].name,
    flag: LanguageConfig[code].flag
  }));
}

export const config: TranslocoGlobalConfig = {
  langs: AvailableLanguages,
  defaultLang: AvailableLangs.ES,
  rootTranslationsPath: './src/assets/i18n'
};

export default config;
