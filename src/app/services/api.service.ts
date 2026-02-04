import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormData } from '../main-form/main-form';
import { IndexedDbService } from './indexed-db.service';
import { NetworkService } from './network.service';

export interface ApiResponse extends FormData {
  id?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  readonly #apiUrl = 'https://jsonplaceholder.typicode.com/posts';
  private http = inject(HttpClient);
  private indexedDbService = inject(IndexedDbService);
  private networkService = inject(NetworkService);


  // Signals para el estado
  isLoading = signal(false);
  value = signal<ApiResponse | null>(null);
  error = signal<string | null>(null);

  async enviarFormulario(datos: FormData): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    console.log('🚀 [ApiService] Starting form submission:', datos);
    console.log('🌐 [ApiService] Network status:', this.networkService.isOnline() ? 'ONLINE' : 'OFFLINE');

    // Si estamos offline, guardar en IndexedDB
    if (!this.networkService.isOnline()) {
      console.log('📴 [ApiService] Offline mode - saving to IndexedDB');
      try {
        await this.indexedDbService.saveForm(datos);
        this.error.set('Formulario guardado localmente. Puede sincronizarlo manualmente desde la sección de datos offline.');
        console.log('✅ [ApiService] Form saved locally successfully');
        return;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        this.error.set(`Error al guardar formulario localmente: ${errorMessage}`);
        console.error('❌ [ApiService] IndexedDB save error:', err);
        return;
      } finally {
        this.isLoading.set(false);
      }
    }

    // Si estamos online, enviar normalmente
    console.log('🌐 [ApiService] Online mode - sending to API');
    try {
      // Delay para testear el loading signal (solo en desarrollo)
      if (isDevMode()) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const observable = this.http.post<ApiResponse>(this.#apiUrl, datos);
      const result = await firstValueFrom(observable);
      console.log('✅ [ApiService] API response:', result);
      this.value.set(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.error.set('Error al enviar formulario');
      console.error('❌ [ApiService] API error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }


  reset(): void {
    this.isLoading.set(false);
    this.value.set(null);
    this.error.set(null);
  }
}
