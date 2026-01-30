import { Component, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pwa-status-bar',
  imports: [CommonModule],
  template: `
    <div class="status-bar" [class.online]="isOnline()" [class.offline]="!isOnline()">
      <div class="status-content">
        <span class="status-indicator"></span>
        <span class="status-text">
          @if (isOnline()) {
            Conectado
          } @else {
            Sin conexión - Modo offline
          }
        </span>
        @if (lastUpdate()) {
          <span class="last-update">
            Última actualización: {{ lastUpdate() | date:'shortTime' }}
          </span>
        }
      </div>
    </div>
  `,
  styleUrl: './status-bar.css',
})
export class StatusBar {
  private destroyRef = inject(DestroyRef);

  readonly isOnline = signal(navigator.onLine);
  readonly lastUpdate = signal<Date | null>(new Date());

  constructor() {
    this.setupConnectionListeners();
  }

  private setupConnectionListeners(): void {
    const updateOnlineStatus = () => {
      this.isOnline.set(navigator.onLine);
      if (navigator.onLine) {
        this.lastUpdate.set(new Date());
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Limpiar listeners cuando se destruya el componente
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    });
  }
}
