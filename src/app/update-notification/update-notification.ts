import { Component, inject, signal } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pwa-update-notification',
  imports: [CommonModule],
  template: `
    @if (showUpdateBanner()) {
      <div class="update-banner">
        <div class="update-content">
          <span class="update-message">
            ✨ ¡Actualización disponible! Nueva versión lista
          </span>
          <div class="update-actions">
            <button 
              class="btn-update" 
              (click)="activateUpdate()"
              [disabled]="isUpdating()"
            >
              @if (isUpdating()) {
                <span class="spinner"></span>
                Actualizando...
              } @else {
                Actualizar ahora
              }
            </button>
            <button 
              class="btn-dismiss" 
              (click)="dismissBanner()"
              [disabled]="isUpdating()"
            >
              Más tarde
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './update-notification.css',
})
export class UpdateNotification {
  protected swUpdate = inject(SwUpdate);

  readonly showUpdateBanner = signal(false);
  readonly isUpdating = signal(false);

  constructor() {
    this.checkForUpdates();
  }

  private checkForUpdates(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // Verificar si hay una versión disponible
    this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
      if (event.type === 'VERSION_READY') {
        console.log('Nueva versión disponible:', event);
        this.showUpdateBanner.set(true);
      } else if (event.type === 'VERSION_INSTALLATION_FAILED') {
        console.error('Falló instalación de nueva versión:', event);
      }
    });
  }

  activateUpdate(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.isUpdating.set(true);

    // Activar la nueva versión y recargar la página
    this.swUpdate.activateUpdate().then(() => {
      console.log('Actualización completada, recargando página...');
      document.location.reload();
    }).catch(error => {
      console.error('Error al activar actualización:', error);
      this.isUpdating.set(false);
    });
  }

  dismissBanner(): void {
    this.showUpdateBanner.set(false);
  }
}
