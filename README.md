# Angular PWA Offline Form

Aplicación web progresiva (PWA) con formulario offline, soporte multiidioma y sincronización de datos.

## 📋 Tabla de Contenidos

- [🚀 Quick Start](#-quick-start)
- [🌍 Internacionalización](#-internacionalización-con-jstransloco)
- [💾 Almacenamiento Offline](#-indexeddb-en-angular-pwa)
- [⚙️ Configuración PWA](#-configuración-pwa)
- [🛠️ Guía de Desarrollo](#️-guía-de-desarrollo)
- [📚 Referencias](#-documentación)

---

## 🚀 Quick Start

### Requisitos Previos
- Node.js 20.19.6+
- Angular CLI 21+

### Instalación y Ejecución
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve

# Build para producción
ng build --configuration production
```

---

## 🌍 Internacionalización con @jsverse/transloco

### Configuración Offline-First

Para que las traducciones funcionen correctamente en modo offline, es necesario configurar dos archivos clave:

#### 1. **ngsw-config.json** - Service Worker Cache
```json
{
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/**/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"
        ]
      }
    },
    {
      "name": "i18n",
      "installMode": "prefetch",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/i18n/*.json"
        ]
      }
    }
  ]
}
```

**Configuración clave**:
- `"installMode": "prefetch"`: Cachea todos los archivos JSON al instalar la PWA
- `"updateMode": "prefetch"`: Busca actualizaciones en segundo plano
- `"files": ["/assets/i18n/*.json"]`: Específico para archivos de traducción

#### 2. **src/app/features/i18n/loaders/transloco-loader.ts** - Loader Simple
```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslocoLoader, Translation } from '@jsverse/transloco';
import { catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TranslocoHttpLoader implements TranslocoLoader {
    private readonly http = inject(HttpClient);

    getTranslation(lang: string) {
        return this.http.get<Translation>(`/assets/i18n/${lang}.json`).pipe(
            catchError((error) => {
                console.warn(`Failed to load translation for language: ${lang}`, error);
                return of({});
            })
        );
    }
}
```

**Características**:
- **Simple**: Solo 15 líneas de código
- **Robusto**: `catchError` evita que la app crashee
- **Offline-first**: El Service Worker maneja todo el cacheo

### Flujo Offline Completo

1. **Primera visita online**:
   - Service Worker cachea `es.json`, `en.json`, `pt.json`
   - Todos los idiomas disponibles inmediatamente

2. **Modo offline**:
   - Service Worker sirve traducciones desde cache
   - Cambio de idioma funciona perfectamente

3. **Actualizaciones**:
   - Service Worker busca nuevas versiones automáticamente
   - Se actualizan en segundo plano sin interrumpir

### Configuración Centralizada

#### **features/i18n/config/transloco.config.ts**
```typescript
export enum AvailableLangs { ES = 'es', EN = 'en', PT = 'pt', FR = 'fr' }

export const AvailableLanguages = [AvailableLangs.ES, AvailableLangs.EN, AvailableLangs.PT, AvailableLangs.FR];

export const LanguageConfig = {
  [AvailableLangs.ES]: { name: 'Español', flag: '🇪🇸' },
  [AvailableLangs.EN]: { name: 'English', flag: '🇬🇧' },
  [AvailableLangs.PT]: { name: 'Português', flag: '🇵🇹' },
  [AvailableLangs.FR]: { name: 'Français', flag: '🇫🇷' }
} as const;

export function getAvailableLanguages() {
  return AvailableLanguages.map(code => ({
    code,
    name: LanguageConfig[code].name,
    flag: LanguageConfig[code].flag
  }));
}
```

#### **features/i18n/services/language.service.ts** - Estado Reactivo
```typescript
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private _currentLang = signal<string>(this.getInitialLanguage());
  readonly currentLang = this._currentLang.asReadonly();

  constructor() {
    effect(() => localStorage.setItem('preferred-language', this._currentLang()));
  }

  setLanguage(lang: string) {
    this._currentLang.set(lang);
    this.translocoService.setActiveLang(lang);
  }
}
```

#### **features/i18n/components/language-selector.ts** - UI Component
```typescript
@Component({ standalone: true, imports: [FormsModule] })
export class LanguageSelector {
  protected currentLangValue = this.languageService.currentLang();
  protected get languages() { return getAvailableLanguages(); }

  onLanguageChange(lang: AvailableLangs) {
    this.languageService.setLanguage(lang);
  }
}
```

### Estructura de Archivos

```
src/app/features/i18n/
├── services/language.service.ts    ← Estado con signals
├── config/transloco.config.ts      ← Configuración central
├── loaders/transloco-loader.ts     ← Carga de traducciones
└── components/language-selector/    ← UI Component
```

### Añadir Nuevo Idioma

1. **Actualizar configuración:**
```typescript
// transloco.config.ts
export enum AvailableLangs { ES = 'es', EN = 'en', PT = 'pt', FR = 'fr', DE = 'de' }
export const LanguageConfig = { ..., [AvailableLangs.DE]: { name: 'Deutsch', flag: '🇩🇪' } }
```

2. **Crear archivo:** `assets/i18n/de.json`
3. **¡Listo!** - El selector detecta el nuevo idioma automáticamente

### Uso en Templates

```html
<!-- Traducción simple -->
<h1>{{ 'APP.TITLE' | transloco }}</h1>

<!-- Con parámetros -->
<span>{{ 'pendingForms' | transloco: { count: pendingCount } }}</span>

<!-- Directivas -->
<div transloco="FORM.TITLE"></div>
```

### Arquitectura: Signals + ngModel

**Ventajas del enfoque híbrido:**
- ✅ **Signals** - Reactividad global centralizada
- ✅ **ngModel** - Binding robusto sin race conditions  
- ✅ **Servicio** - Separación de responsabilidades
- ✅ **Dinámico** - Fácil añadir idiomas

| Enfoque | Ventajas | Desventajas |
|---------|----------|-------------|
| Solo ngModel | ✅ Sin race conditions | ❌ Sin reactividad |
| Solo signals | ✅ Reactividad completa | ❌ Race conditions |
| **Híbrido** | ✅ Lo mejor de ambos | ✅ Solución completa |


---

## 💾 IndexedDB en Angular PWA

### ¿Qué es IndexedDB?
IndexedDB es una base de datos transaccional del navegador que permite almacenar grandes cantidades de datos de forma persistente. Es ideal para aplicaciones PWA que necesitan funcionar offline.

### Arquitectura del Servicio

#### 1. Servicio IndexedDbService
```typescript
// indexed-db.service.ts
@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbName = 'OfflineFormsDB';
  private storeName = 'forms';
  private db: IDBDatabase | null = null;

  // Signals para estado reactivo
  isInitialized = signal(false);
  error = signal<string | null>(null);
  pendingForms = signal<StoredFormData[]>([]);

  async init(): Promise<void> {
    // Inicialización lazy de la base de datos
  }
}
```

#### 2. Estrategia de Datos: getAll() + filter()
```typescript
// Estrategia robusta similar a React (sin índices)
async getPendingForms(): Promise<StoredFormData[]> {
  const request = store.getAll(); // ← Obtener todo
  
  request.onsuccess = () => {
    const allForms = request.result;
    const pendingForms = allForms.filter(item => !item.synced); // ← Filtrar en JS
    return pendingForms;
  };
}
```

### Lazy Loading vs Eager Loading

#### Lazy Loading (Actual)
- **Ventajas**: La app arranca más rápido
- **Desventajas**: Los componentes deben verificar inicialización
- **Uso**: `await this.initIfNeeded()` en cada método

#### Eager Loading con APP_INITIALIZER
- **Ventajas**: DB disponible inmediatamente
- **Desventajas**: Arranca más lento
- **Uso**: Sin verificaciones, DB siempre lista

### Métodos Principales

#### 1. Guardar Formularios Offline
```typescript
async saveForm(formData: FormData): Promise<number> {
  await this.initIfNeeded(); // Lazy loading
  
  const dataToSave = {
    ...formData,
    synced: false,
    timestamp: new Date().toISOString()
  };
  
  const id = await this.addToStore(dataToSave);
  this.loadPendingForms(); // Actualizar signal
  
  return id;
}
```

#### 2. Obtener Formularios Pendientes
```typescript
async getPendingForms(): Promise<StoredFormData[]> {
  await this.initIfNeeded();
  
  const allForms = await this.getAllFromStore();
  return allForms.filter(item => !item.synced);
}
```

#### 3. Marcar como Sincronizado
```typescript
async markAsSynced(formId: number): Promise<void> {
  await this.initIfNeeded();
  
  const form = await this.getFromStore(formId);
  if (form) {
    form.synced = true;
    form.syncedAt = new Date().toISOString();
    await this.updateInStore(form);
  }
  
  await this.deleteSyncedForms(); // Limpieza automática
}
```

#### 4. Borrar Formularios Sincronizados
```typescript
async deleteSyncedForms(): Promise<void> {
  await this.initIfNeeded();
  
  const allForms = await this.getAllFromStore();
  const syncedForms = allForms.filter(item => item.synced === true);
  
  // Borrar en batch
  const deletePromises = syncedForms.map(form => this.deleteFromStore(form.id!));
  await Promise.all(deletePromises);
  
  this.loadPendingForms(); // Actualizar signal
}
```

### Comunicación entre Componentes

#### Servicio de Estado Centralizado (Patrón Reactivo)
```typescript
// pending-forms-state.service.ts
@Injectable({ providedIn: 'root' })
export class PendingFormsStateService {
  private indexedDbService = inject(IndexedDbService);
  
  pendingFormsCount = signal(0);
  readonly hasPendingForms = computed(() => this.pendingFormsCount() > 0);
  readonly statusMessage = computed(() => {
    const count = this.pendingFormsCount();
    return count === 0 ? 'Todo sincronizado' : `${count} pendientes`;
  });

  constructor() {
    // Escuchar cambios automáticamente en IndexedDbService
    effect(() => {
      const pendingForms = this.indexedDbService.pendingForms();
      this.pendingFormsCount.set(pendingForms.length);
    });
  }
}
```

#### IndexedDbService (Solo Datos)
```typescript
export class IndexedDbService {
  pendingForms = signal<StoredFormData[]>([]);
  
  async saveForm(formData: FormData): Promise<number> {
    // Guardar en IndexedDB...
    this.loadPendingForms(); // ← Actualiza su signal automáticamente
  }
}
```

#### Componentes (Consumo Reactivo)
```typescript
// Badge indicator
export class PendingFormsIndicator {
  private pendingState = inject(PendingFormsStateService);
  
  // Template: @if (pendingState.hasPendingForms()) { ... }
}

// Data viewer (completamente reactivo)
export class OfflineData {
  constructor() {
    this.initializeComponent();
    
    // Escuchar cambios automáticamente en IndexedDbService
    effect(() => {
      const pendingForms = this.indexedDbService.pendingForms();
      this.pendingForms.set(pendingForms.sort((a, b) => b.timestamp - a.timestamp));
      this.isLoading.set(false);
    });
  }

  async syncForm(form: StoredFormData): Promise<void> {
    await this.indexedDbService.markAsSynced(form.id!);
    // No necesita recargar manualmente - effect() actualiza automáticamente
  }
}
```

### Estrategia de Acceso a Datos

#### Por qué usamos getAll() + filter() en lugar de índices:

1. **Robustez**: `getAll()` siempre funciona, los índices pueden fallar
2. **Simplicidad**: Sin try/catch para manejo de errores de índices
3. **Consistencia**: Mismo comportamiento en todos los navegadores
4. **Mantenimiento**: Código más simple y fácil de entender

#### Comparación de Estrategias

| Estrategia | Ventajas | Desventajas | Uso recomendado |
|------------|----------|-------------|----------------|
| **Índices** | Rápido, eficiente | Complejo, puede fallar | Grandes volúmenes de datos |
| **getAll() + filter()** | Simple, robusto | Más lento para muchos datos | **PWA con pocos formularios** |

### Mejores Prácticas

#### 1. Lazy Loading para PWAs
```typescript
async saveForm(formData: FormData): Promise<number> {
  if (!this.db) {
    await this.init(); // ← Solo cuando se necesita
  }
  // ... guardar datos
}
```

#### 2. Signals para Estado Reactivo
```typescript
// IndexedDbService expone datos
class IndexedDbService {
  pendingForms = signal<StoredFormData[]>([]);
}

// Componentes escuchan automáticamente
class OfflineData {
  constructor() {
    effect(() => {
      const forms = this.indexedDbService.pendingForms();
      this.pendingForms.set(forms.sort((a, b) => b.timestamp - a.timestamp));
      this.isLoading.set(false);
    });
  }
}

// Sin llamadas manuales - todo reactivo
```

#### 3. Comunicación Desacoplada con Signals
```typescript
// IndexedDbService (Data Layer) - Solo gestiona datos
pendingForms = signal<StoredFormData[]>([]);

// PendingFormsStateService (State Layer) - Estado derivado
constructor() {
  effect(() => {
    const forms = this.indexedDbService.pendingForms();
    this.pendingFormsCount.set(forms.length);
  });
}

// OfflineData (UI Layer) - Consumo reactivo completo
constructor() {
  effect(() => {
    const pendingForms = this.indexedDbService.pendingForms();
    this.pendingForms.set(pendingForms.sort((a, b) => b.timestamp - a.timestamp));
    this.isLoading.set(false);
  });
}

// PendingFormsIndicator (UI Simple) - Solo estado derivado
readonly hasPendingForms = pendingStateService.hasPendingForms;
```

### Configuración de la Base de Datos

#### Estructura de Datos
```typescript
interface StoredFormData {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  categoria: string;
  observaciones?: string;
  synced: boolean;        // ← Estado de sincronización
  timestamp: string;      // ← Cuándo se creó
  syncedAt?: string;      // ← Cuándo se sincronizó
}
```

---

### Configurar el Service Worker

#### 1. Crear PWA
```bash
ng add @angular/pwa
ng add @angular/pwa --project [nombre-proyecto]
```

#### 2. ngsw-config.json
En el archivo `ngsw-config.json` se configuran las opciones del service worker.

```json
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(svg|cur|jpg|jpeg|png|gif|webp|avif)"
        ]
      }
    }
  ]
}
```

#### 3. app.config.ts
```typescript
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),           // Solo en producción
  registrationStrategy: 'registerWhenStable:30000'  // 30s después de estabilizar
})
```

### Probar el PWA

#### 1. Build inicial
```bash
ng build --configuration production
```

#### 2. Servir
```bash
npx serve dist/angular.pwa.offline-form/browser -p 4200
```

#### 3. Testing inicial
```bash
http://localhost:4200
DevTools → Application → Offline → Marcar "Offline"
```

#### 4. Simular actualización
```bash
# a) Detener servidor (Ctrl+C)
# b) Modificar código 
# c) ng build --configuration production
```

#### 5. Ponerse online ANTES de recargar
```bash
DevTools → Application → Offline → Desmarcar "Offline"
```

#### 6. Recargar para que el service worker detecte la nueva versión
```bash
F5
```

#### 7. Esperar actualización
```bash
# Esperar 30 segundos (por que en app.config.ts se configuro con registerWhenStable:30000) → Banner UpdateNotification debería aparecer
# Click "Actualizar" → App recargada con el cambio realizado
```

---

## 🛠️ Guía de Desarrollo

### Instalar Node.js

Instalar NVM for windows y después en consola (PowerShell como administrador)

```bash
nvm install latest
nvm install 20.19.6 //Versión estable y compatible con Angular 21
nvm install lts //Ultima versión LTS (Long Term Support) más estable
```

#### Listar las versiones instaladas
```bash
nvm list
```

#### Utilizar la versión concreta
```bash
nvm use [version]
```

### Instalar Angular
```bash
npm install -g @angular/cli
```

#### Comprobar la versión de angular
```bash
ng version
```

### Crear Proyecto Angular
```bash
ng new [nombre-proyecto] -t --prefix [prefijo] --routing
```
- `--prefix` Crea el proyecto con el prefijo [prefijo]- para los componentes. Es recomendable para evitar colisiones de nombres
- `--routing` Crea el proyecto con el sistema de rutas de Angular

### Lanzar Proyecto
```bash
ng serve
```

### Generar Componentes
```bash
ng generate component [nombre-componente]
ng g c [nombre-componente]
```

### Añadir Rutas en app.routes.ts
```typescript
import { Routes } from '@angular/router';
import { [NombreComponente] } from './[nombre-componente]/[nombre-componente]';

const routes: Routes = [
    //Ruta principal
    { path: '', component: [NombreComponente] },

    //Ruta secundaria (details de main list, etc)

    //Lazy load del componente details con id en la url
    { path: ':id', loadComponent: () => import('./[nombre-componente-details]/[nombre-componente-details].component').then(m => m.[NombreComponenteDetails]) },

    //Lazy load del componente details con name en la url
    { path: ':name', loadComponent: () => import('./[nombre-componente-details]/[nombre-componente-details].component').then(m => m.[NombreComponenteDetails]) },

    //Ruta wildcard para redirigir a la ruta principal si se introduce una ruta no existente
    { path: '**', redirectTo: '', pathMatch: 'full' },
];
```

#### RouterLink en el componente
```typescript
import { RouterLink } from '@angular/router';

@Component({
  selector: 'form-details',
  imports: [RouterLink],
  template: `
    <h1>Details</h1>
    <a [routerLink]="['/list']" queryParamsHandling="preserve">Back</a>
  `
})
```

#### withComponentInputBinding en app.config.ts
Si vamos a usar rutas por ejemplo para un details que recibe en la url un id o name,
Podemos usar withComponentInputBinding en app.config.ts para que convierta automáticamente los parámetros de la ruta en inputs del componente

```typescript
// app.config.ts
provideRouter(routes, withComponentInputBinding())

// Componente details
readonly id = input<string>();
```

### Generar Servicios
```bash
ng generate service [nombre-servicio]
ng g s [nombre-servicio]
```

### Generar Pipes
```bash
ng generate pipe [nombre-pipe]
ng g p [nombre-pipe]
```

### Generar Loaders
```bash
ng generate c [nombre-loader]
ng g c [nombre-loader] 
```

---

## 📚 Documentación

### Documentación Oficial de Angular
- [Angular Documentation](https://angular.dev/)
- [Angular Installation](https://angular.dev/installation)

### Referencias del Proyecto
- [@jsverse/transloco](https://jsverse.github.io/transloco/) - Internacionalización moderna
- [Angular PWA](https://angular.dev/guides/pwa) - Progressive Web Apps
- [Angular Signals](https://angular.dev/guide/signals) - Reactividad moderna









