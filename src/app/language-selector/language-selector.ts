import { Component, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';
import { AvailableLangs, AvailableLanguages } from '../transloco.config';

// 🎯 Interfaz que coincide con la configuración del servicio
export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'pwa-language-selector',
  imports: [FormsModule],
  template: `
    <div class="language-selector">
      <select [(ngModel)]="selectedLang" (ngModelChange)="onLanguageChange($event)" 
              class="language-select">
        @for (lang of languages; track lang.code) {
          <option [value]="lang.code">
            {{ lang.flag }} {{ lang.name }}
          </option>
        }
      </select>
    </div>
  `,
  styleUrl: './language-selector.css',
})
export class LanguageSelector {
  protected translocoService = inject(TranslocoService);

  // 🎯 Propiedad para el binding con ngModel
  protected selectedLang = this.getInitialLanguage();

  // 🎯 Obtener idioma inicial desde localStorage o por defecto
  private getInitialLanguage(): string {
    const savedLang = localStorage.getItem('preferred-language');
    return savedLang || AvailableLangs.ES;
  }

  // 🎯 Configuración de idiomas con nombres en su idioma nativo
  protected get languages(): Language[] {
    return [
      { code: AvailableLangs.ES, name: 'Español', flag: '🇪🇸' },
      { code: AvailableLangs.EN, name: 'English', flag: '🇬🇧' },
      { code: AvailableLangs.PT, name: 'Português', flag: '🇵🇹' }
    ];
  }

  constructor() {
    // 🎯 Establecer idioma inicial
    this.translocoService.setActiveLang(this.selectedLang);
  }

  onLanguageChange(newLang: string): void {
    // Actualizar nuestra propiedad y el servicio
    this.selectedLang = newLang;
    this.translocoService.setActiveLang(newLang);
    localStorage.setItem('preferred-language', newLang);
  }
}
