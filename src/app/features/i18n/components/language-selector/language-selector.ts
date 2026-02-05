import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getAvailableLanguages, AvailableLangs } from '../../config/transloco.config';
import { LanguageService } from '../../services/language.service';

export type Language = ReturnType<typeof getAvailableLanguages>[0];

@Component({
  selector: 'pwa-language-selector',
  imports: [FormsModule],
  template: `
    <div class="language-selector">
      <select [(ngModel)]="currentLangValue" 
              (ngModelChange)="onLanguageChange($event)" 
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
  protected readonly languageService = inject(LanguageService);

  // Inicialización directa - el servicio ya está inicializado cuando se inyecta
  protected currentLangValue = this.languageService.currentLang();

  // Dinámico - obtiene idiomas desde la configuración centralizada
  protected get languages(): Language[] {
    return getAvailableLanguages();
  }

  onLanguageChange(newLang: AvailableLangs): void {
    this.languageService.setLanguage(newLang);
  }
}
