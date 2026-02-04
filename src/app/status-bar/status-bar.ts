import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../services/network.service';

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
  private readonly networkService = inject(NetworkService);

  readonly isOnline = computed(() => this.networkService.isOnline());
  readonly lastUpdate = signal<Date | null>(null);

  constructor() {
    effect(() => {
      // Actualizar lastUpdate cuando volvemos online
      if (this.networkService.isOnline()) {
        this.lastUpdate.set(new Date());
      }
    });
  }
}
