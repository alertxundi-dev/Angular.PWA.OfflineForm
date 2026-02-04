import { Injectable, signal } from '@angular/core';
import { FormData } from '../main-form/main-form';

export interface StoredFormData extends FormData {
  id?: number;
  timestamp: number;
  synced: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbName = 'OfflineFormsDB';
  private storeName = 'forms';
  private db: IDBDatabase | null = null;

  // Signals para estado
  isInitialized = signal(false);
  error = signal<string | null>(null);
  pendingForms = signal<StoredFormData[]>([]);

  async init(): Promise<void> {
    if (this.isInitialized()) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        this.error.set('Error al abrir IndexedDB');
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized.set(true);
        console.log('IndexedDB initialized successfully');
        this.updatePendingForms();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
          console.log('IndexedDB object store created');
        }
      };
    });
  }

  async initIfNeeded(): Promise<void> {
    if (!this.isInitialized()) {
      await this.init();
    }
  }

  private updatePendingForms(): void {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      const allForms = request.result;
      const pendingForms = allForms.filter((item: StoredFormData) => !item.synced);

      console.log('📋 [IndexedDB] Pending forms loaded:', pendingForms.length);
      if (pendingForms.length > 0) {
        console.log('📋 [IndexedDB] Pending forms data:', pendingForms);
      }

      this.pendingForms.set(pendingForms);
    };

    request.onerror = () => {
      console.error('Error loading pending forms:', request.error);
    };
  }


  async saveForm(formData: FormData): Promise<number> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const storedForm: StoredFormData = {
      ...formData,
      timestamp: Date.now(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(storedForm);

      request.onsuccess = () => {
        const formId = request.result as number;
        console.log('📝 [IndexedDB] Form saved locally with ID:', formId);
        console.log('📝 [IndexedDB] Form data:', storedForm);
        this.updatePendingForms();
        resolve(formId);
      };

      request.onerror = () => {
        this.error.set('Error al guardar formulario');
        reject(request.error);
      };
    });
  }

  async getPendingForms(): Promise<StoredFormData[]> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const allForms = request.result;
        const pendingForms = allForms.filter((item: StoredFormData) => !item.synced);
        resolve(pendingForms);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async markAsSynced(formId: number): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const getRequest = store.get(formId);

      getRequest.onsuccess = () => {
        const form = getRequest.result;
        if (form) {
          console.log('🔄 [IndexedDB] Marking form as synced:', formId);
          form.synced = true;
          const updateRequest = store.put(form);

          updateRequest.onsuccess = () => {
            console.log('✅ [IndexedDB] Form marked as synced, cleaning up...');
            this.deleteSyncedForms().then(() => {
              this.updatePendingForms();
              resolve();
            });
          };

          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Form not found'));
        }
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  async deleteSyncedForms(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const allForms = request.result;
        const syncedForms = allForms.filter((item: StoredFormData) => item.synced === true);

        console.log('🗑️ [IndexedDB] Found synced forms to delete:', syncedForms.length);

        const deletePromises = syncedForms.map(form => {
          return new Promise<void>((deleteResolve, deleteReject) => {
            const deleteRequest = store.delete(form.id!);
            deleteRequest.onsuccess = () => {
              console.log('🗑️ [IndexedDB] Deleted synced form:', form.id);
              deleteResolve();
            };
            deleteRequest.onerror = () => deleteReject(deleteRequest.error);
          });
        });

        Promise.all(deletePromises)
          .then(() => {
            console.log('✅ [IndexedDB] All synced forms deleted successfully');
            this.updatePendingForms();
            resolve();
          })
          .catch(reject);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteForm(formId: number): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(formId);

      request.onsuccess = () => {
        console.log('🗑️ [IndexedDB] Form deleted manually:', formId);
        this.updatePendingForms();
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  clearError(): void {
    this.error.set(null);
  }
}
