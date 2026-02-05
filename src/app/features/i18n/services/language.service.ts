import { Injectable, inject, signal, effect, runInInjectionContext } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { AvailableLangs, AvailableLanguages } from '../config/transloco.config';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly translocoService = inject(TranslocoService);
  private readonly STORAGE_KEY = 'preferred-language';

  private _currentLang = signal<string>(AvailableLangs.ES);
  readonly currentLang = this._currentLang.asReadonly();

  constructor() {
    // Inicialización robusta
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const initialLang = this.getInitialLanguage();

    // Actualizar el signal
    this._currentLang.set(initialLang);

    // Establecer en TranslocoService
    this.translocoService.setActiveLang(initialLang);

    // Efecto para sincronizar con localStorage
    effect(() => {
      const lang = this._currentLang();
      try {
        localStorage.setItem(this.STORAGE_KEY, lang);
      } catch (error) {
        console.warn('Failed to save language to localStorage:', error);
      }
    });

    // Debug: Verificar que el valor se estableció correctamente
    console.log('LanguageService initialized with:', {
      initialLang,
      signalValue: this._currentLang(),
      translocoLang: this.translocoService.getActiveLang()
    });
  }

  private getInitialLanguage(): string {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      const validLang = saved && AvailableLanguages.includes(saved as AvailableLangs)
        ? saved
        : AvailableLangs.ES;

      console.log('getInitialLanguage result:', { saved, validLang });
      return validLang;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return AvailableLangs.ES;
    }
  }

  setLanguage(lang: string): void {
    console.log('setLanguage called with:', lang);
    this._currentLang.set(lang);
    this.translocoService.setActiveLang(lang);
  }
}
