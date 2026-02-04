import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexedDbService, StoredFormData } from '../services/indexed-db.service';
import { ApiService } from '../services/api.service';
import { NetworkService } from '../services/network.service';
import { TranslocoModule } from '@jsverse/transloco';

//Crear index.ts en shared/pipes y usar barrel export
//import { FormatDatePipe } from '../shared/pipes/format-date.pipe';
//import { CategoryLabelPipe } from '../shared/pipes/category-label.pipe';
import { FormatDatePipe, CategoryLabelPipe } from '../shared/pipes';
import { Loader } from '../loader/loader';

@Component({
  selector: 'pwa-offline-data',
  imports: [CommonModule, FormatDatePipe, CategoryLabelPipe, Loader, TranslocoModule],
  template: `
    <div class="offline-data-container">
      <div class="offline-data-header">
        <h2 class="offline-data-title">{{ 'OFFLINE.TITLE' | transloco }}</h2>
        <p class="offline-data-subtitle">
          {{ 'OFFLINE.SUBTITLE' | transloco }}
        </p>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <pwa-loader text="{{ 'OFFLINE.LOADING' | transloco }}" size="large" [showSpinner]="false" />
        </div>
      } @else if (pendingForms().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <p class="empty-text">{{ 'OFFLINE.EMPTY' | transloco }}</p>
        </div>
      } @else {
        <div class="forms-list">
          @for (form of pendingForms(); track form.id) {
            <div class="form-card">
              <div class="form-header">
                <div class="form-info">
                  <div class="form-status">
                    <span class="status-indicator"></span>
                    <span class="form-timestamp">
                      {{ 'OFFLINE.SAVED_ON' | transloco }} {{ form.timestamp | formatDate }}
                    </span>
                  </div>
                  <h3 class="form-name">
                    {{ form.nombre }} {{ form.apellido }}
                  </h3>
                  <p class="form-email">{{ form.email }}</p>
                  <div>
                    <span class="category-badge">
                      {{ form.categoria | categoryLabel }}
                    </span>
                  </div>
                  @if (form.observaciones) {
                    <div class="form-observations">
                      <div class="observations-label">{{ 'OFFLINE.OBSERVATIONS_LABEL' | transloco }}</div>
                      <div class="observations-text">{{ form.observaciones }}</div>
                    </div>
                  }
                </div>
              </div>
              
              <div class="form-actions">
                <button 
                  (click)="syncForm(form)"
                  [disabled]="syncingFormId() === form.id"
                  [class]="syncingFormId() === form.id ? 'btn-sync loading' : 'btn-sync'">
                  @if (syncingFormId() === form.id) {
                    <pwa-loader text="{{ 'form.actions.submitting' | transloco }}" size="small" />
                  } @else {
                    <span>{{ 'OFFLINE.SEND_NOW' | transloco }}</span>
                  }
                </button>
                <button 
                  (click)="deleteForm(form.id!)"
                  class="btn-delete">
                  {{ 'OFFLINE.DELETE' | transloco }}
                </button>
              </div>
            </div>
          }
        </div>

        <div class="info-tip">
          <p class="info-tip-text">
            <span class="info-tip-icon">💡</span> <strong>Tip:</strong> {{ 'OFFLINE.TIP' | transloco }}
          </p>
        </div>
      }
    </div>
  `,
  styleUrl: './offline-data.css'
})
export class OfflineData {
  private indexedDbService = inject(IndexedDbService);
  private apiService = inject(ApiService);
  private networkService = inject(NetworkService);

  //Signal para controlar el estado de carga inicial (mientras se inicializa indexedDbService)
  isLoading = signal(true);

  //Computed signal que se actualiza automáticamente cuando IndexedDbService cambia
  readonly pendingForms = computed(() =>
    this.indexedDbService.pendingForms().sort((a, b) => b.timestamp - a.timestamp)
  );

  //Signal para controlar el ID del formulario que se está sincronizando y reflejarlo en el template
  syncingFormId = signal<number | null>(null);

  constructor() {
    this.initializeComponent();
  }

  private async initializeComponent(): Promise<void> {
    try {
      await this.indexedDbService.initIfNeeded();
      //IndexedDbService se inicializa correctamente
      this.isLoading.set(false);
    } catch (error) {
      console.error('Error initializing offline data component:', error);
      this.isLoading.set(false);
    }
  }


  async syncForm(form: StoredFormData): Promise<void> {
    console.log('🔄 [OfflineData] Starting manual sync for form:', form.id);

    if (!this.networkService.isOnline()) {
      console.log('📴 [OfflineData] Cannot sync - no internet connection');
      alert('No hay conexión a internet. Por favor, conéctese e intente nuevamente.');
      return;
    }

    //Actualizo el signal para mostrar el estado de sincronización
    this.syncingFormId.set(form.id!);
    console.log('⏳ [OfflineData] Syncing form ID:', form.id);

    try {
      console.log('📤 [OfflineData] Sending form to API...');
      await this.apiService.enviarFormulario({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        categoria: form.categoria,
        observaciones: form.observaciones
      });

      console.log('✅ [OfflineData] Form sent to API, marking as synced...');
      await this.indexedDbService.markAsSynced(form.id!);
      console.log('✅ [OfflineData] Form marked as synced and cleaned up');

    } catch (error) {
      console.error('❌ [OfflineData] Error syncing form:', error);
      alert('Error al sincronizar el formulario. Por favor, intente nuevamente.');
    } finally {
      this.syncingFormId.set(null);
      console.log('🏁 [OfflineData] Sync process completed for form:', form.id);
    }
  }

  async deleteForm(formId: number): Promise<void> {
    console.log('🗑️ [OfflineData] Deleting form:', formId);

    if (!confirm('¿Está seguro de que desea eliminar este formulario? Esta acción no se puede deshacer.')) {
      console.log('❌ [OfflineData] Delete cancelled by user');
      return;
    }

    try {
      await this.indexedDbService.deleteForm(formId);
      console.log('✅ [OfflineData] Form deleted successfully');
      // No necesita llamar loadPendingForms(), el effect actualiza automáticamente
    } catch (error) {
      console.error('❌ [OfflineData] Error deleting form:', error);
      alert('Error al eliminar el formulario.');
    }
  }

}
