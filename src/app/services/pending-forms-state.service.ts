import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';

/**
 * Service que contiene el estado derivado de formularios pendientes.
 * Reacciona automáticamente a cambios en IndexedDbService.
 */
@Injectable({
  providedIn: 'root',
})
export class PendingFormsStateService {
  private indexedDbService = inject(IndexedDbService);

  // Signal con el contador de formularios pendientes
  pendingFormsCount = signal(0);

  // Computed signals derivados
  readonly hasPendingForms = computed(() => this.pendingFormsCount() > 0);

  constructor() {
    // Escuchar cambios en IndexedDbService y actualizar estado automáticamente
    effect(() => {
      const pendingForms = this.indexedDbService.pendingForms();
      this.pendingFormsCount.set(pendingForms.length);
    });
  }
}
