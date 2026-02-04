import { Injectable, signal, inject, DestroyRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  // Signal reactivo para el estado de conexión
  isOnline = signal(navigator.onLine);

  constructor() {
    this.setupConnectionListeners();
  }

  private setupConnectionListeners(): void {
    const updateStatus = () => {
      this.isOnline.set(navigator.onLine);
      console.log('Network:', navigator.onLine ? 'Online' : 'Offline');
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Limpiar listeners cuando se destruya el servicio
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    });
  }
}
