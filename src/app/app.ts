import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { MainForm } from "./main-form/main-form";
import { OfflineData } from "./offline-data/offline-data";
import { StatusBar } from "./status-bar/status-bar";
import { UpdateNotification } from "./update-notification/update-notification";
import { LanguageSelector } from "./features/i18n/components/language-selector/language-selector";
import { IndexedDbService } from './services/indexed-db.service';

@Component({
  selector: 'pwa-root',
  imports: [TranslocoModule, MainForm, OfflineData, StatusBar, UpdateNotification, LanguageSelector],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container">
      <pwa-update-notification />
      
      <div class="app-header">
        <div class="header-content">
          <div class="brand">
            <h1 class="brand-title">{{ 'APP.TITLE' | transloco }}</h1>
            <p class="brand-subtitle">{{ 'APP.SUBTITLE' | transloco }}</p>
          </div>
          <pwa-language-selector />
        </div>
      </div>

      <main class="main-container">
        <div class="content-grid">
          <div class="form-column">
            <pwa-main-form />
          </div>
          <div class="data-column">
            <pwa-offline-data />
          </div>
        </div>
      </main>

      <pwa-status-bar />
    </div>
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('PWA Offline Form');
  private indexedDbService = inject(IndexedDbService);
}
