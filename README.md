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

Esta aplicación utiliza **@jsverse/transloco**, la librería moderna de internacionalización para Angular.

### Instalación

```bash
npm install @jsverse/transloco @jsverse/transloco-locale
```

### Configuración

#### 1. **transloco-loader.ts** - Loader Personalizado

```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslocoLoader, Translation } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}
```

#### 2. **transloco.config.ts** - Configuración Centralizada

```typescript
import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';

export enum AvailableLangs {
  ES = 'es',
  EN = 'en',
  PT = 'pt'
}

export const AvailableLanguages = [
  AvailableLangs.ES,
  AvailableLangs.EN,
  AvailableLangs.PT
];

export const config: TranslocoGlobalConfig = {
  langs: AvailableLanguages,
  defaultLang: AvailableLangs.ES,
  rootTranslationsPath: './src/assets/i18n'
};
```

#### 3. **app.config.ts** - Configuración de la Aplicación

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco, TRANSLOCO_LOADER } from '@jsverse/transloco';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslocoHttpLoader } from './transloco-loader';
import { AvailableLangs } from './transloco.config';
import { AvailableLanguages } from './transloco.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideTransloco({
      config: {
        availableLangs: AvailableLanguages,
        defaultLang: AvailableLangs.ES,
        reRenderOnLangChange: true,
        prodMode: !isDevMode()
      },
      loader: TranslocoHttpLoader
    })]
};
```

### Estructura de Archivos

```bash
src/assets/i18n/
├── es.json    ← Español
├── en.json    ← Inglés
└── pt.json    ← Português
```

### Formato JSON

```json
{
  "APP": {
    "TITLE": "PWA Formulario Offline",
    "SUBTITLE": "Formulario con modo offline",
    "LANGUAGES": {
      "ES": "Español",
      "EN": "English",
      "PT": "Português"
    }
  },
  "connection": {
    "connected": "Conectado",
    "offline": "Sin conexión (Modo offline)"
  },
  "form": {
    "fields": {
      "name": "Nombre",
      "lastname": "Apellido",
      "email": "Email",
      "category": "Categoría",
      "observations": "Observaciones"
    },
    "placeholders": {
      "selectCategory": "Selecciona una categoría"
    },
    "categories": {
      "general": "General",
      "support": "Soporte",
      "sales": "Ventas",
      "feedback": "Feedback"
    },
    "errors": {
      "nameRequired": "El nombre es obligatorio",
      "lastnameRequired": "El apellido es obligatorio",
      "emailInvalid": "Email inválido",
      "categoryRequired": "La categoría es obligatoria"
    },
    "actions": {
      "submit": "Enviar",
      "submitting": "Enviando"
    },
    "success": "¡Formulario enviado con éxito!"
  },
  "pendingForms": "Formularios pendientes ({{count}})",
  "loading": "Cargando...",
  "OFFLINE": {
    "TITLE": "Formularios Pendientes de Sincronización",
    "SUBTITLE": "Estos formularios se guardaron localmente. Puede enviarlos manualmente cuando tenga conexión.",
    "LOADING": "Cargando formularios pendentes...",
    "EMPTY": "No hay formularios pendientes de sincronización",
    "SAVED_ON": "Guardado el",
    "OBSERVATIONS_LABEL": "Observaciones:",
    "SEND_NOW": "Enviar ahora",
    "DELETE": "Eliminar",
    "TIP": "Los formularios pendientes solo se sincronizan manualmente al presionar 'Enviar ahora'."
  }
}
```

### Uso en Templates

#### Traducción Simple
```html
<h1>{{ 'APP.TITLE' | transloco }}</h1>
<p>{{ 'APP.SUBTITLE' | transloco }}</p>
```

#### Con Parámetros
```html
<span>{{ 'pendingForms' | transloco: { count: pendingCount } }}</span>
```

#### Directivas
```html
<div transloco="FORM.TITLE"></div>
<p transloco>Texto estático traducido</p>
```

### Selector de Idioma con ngModel (Implementación Funcional)

#### Componente LanguageSelector
```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';
import { AvailableLangs, AvailableLanguages } from '../transloco.config';

// 🎯 Interfaz que coincide con la configuración del servicio
export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'pwa-language-selector',
  imports: [FormsModule],
  template: `
    <div class="language-selector">
      <select [(ngModel)]="selectedLang" (ngModelChange)="onLanguageChange($event)" 
              class="language-select">
        @for (lang of languages; track lang.code) {
          <option [value]="lang.code">
            {{ lang.flag }} {{ lang.name }}
          </option>
        }
      </select>
    </div>
  `,
  styleUrl: './language-selector.css',
})
export class LanguageSelector {
  protected translocoService = inject(TranslocoService);
  
  // 🎯 Propiedad para el binding con ngModel
  protected selectedLang = this.getInitialLanguage();

  // 🎯 Obtener idioma inicial desde localStorage o por defecto
  private getInitialLanguage(): string {
    const savedLang = localStorage.getItem('preferred-language');
    return savedLang || AvailableLangs.ES;
  }

  // 🎯 Configuración de idiomas con nombres en su idioma nativo
  protected get languages(): Language[] {
    return [
      { code: AvailableLangs.ES, name: 'Español', flag: '🇪🇸' },
      { code: AvailableLangs.EN, name: 'English', flag: '🇬🇧' },
      { code: AvailableLangs.PT, name: 'Português', flag: '🇵🇹' }
    ];
  }

  constructor() {
    // 🎯 Establecer idioma inicial
    this.translocoService.setActiveLang(this.selectedLang);
  }

  onLanguageChange(newLang: string): void {
    // Actualizar nuestra propiedad y el servicio
    this.selectedLang = newLang;
    this.translocoService.setActiveLang(newLang);
    localStorage.setItem('preferred-language', newLang);
  }
}
```

#### ¿Por qué ngModel en lugar de Signals?

**Problema con Signals (no funciona):**
```typescript
// ❌ Race condition: el signal se inicializa antes que el constructor
currentLang = toSignal(
  this.translocoService.langChanges$,
  { initialValue: this.translocoService.getActiveLang() }
);
// Resultado: El selector muestra el idioma incorrecto al cargar la página
```

**Solución con ngModel (funciona perfectamente):**
```typescript
// ✅ Timing perfecto: propiedad se inicializa antes del renderizado
selectedLang = this.getInitialLanguage(); // Lee localStorage inmediatamente
// Resultado: El selector muestra correctamente el idioma guardado
```

**Ventajas de ngModel para este caso:**
- ✅ **Sincronización perfecta** - Sin race conditions
- ✅ **Simplicidad** - Menos código que mantener
- ✅ **Performance** - Sin overhead de observables
- ✅ **Mantenimiento** - Código más legible para equipos pequeños

### Características Avanzadas

#### Template-Driven Forms (ngModel)
- **Binding bidireccional** simple y eficiente
- **Sincronización perfecta** con localStorage
- **Sin race conditions** en la inicialización
- **Performance óptima** para casos simples

#### Lazy Loading
- Carga idiomas bajo demanda
- Solo descarga el idioma necesario
- Cache inteligente automático

#### Type Safety
- Soporte completo de TypeScript
- Autocompletado de claves
- Validación en tiempo de compilación

#### Interpolación
- Soporte para parámetros: `{{count}}`
- Pluralización automática
- Formato de fechas y números

#### Template-Driven vs Reactive Forms
- **ngModel**: Simple para casos como selectores de idioma
- **FormControl**: Poderoso para formularios complejos
- **Elección correcta**: ngModel para este proyecto

### Arquitectura del Selector: ngModel vs Signals

#### Flujo de Datos (ngModel - Funciona):
```
localStorage ──► getInitialLanguage() ──► selectedLang ──► [(ngModel)] ──► <select>
     'en'              'en'               'en'           binding          value="en"
```

#### Jerarquía de Soluciones para Selectores:
1. **ngModel** (🥇 Perfecto para este caso) - Simple, sin race conditions
2. **FormControl** (🥈 Viable pero excesivo) - Más boilerplate
3. **Signals** (🥉 Problemático) - Race conditions en inicialización

### Comparación: @ngx-translate vs @jsverse/transloco

| Característica | @ngx-translate | @jsverse/transloco |
|---------------|----------------|-------------------|
| **Signals** | ❌ No nativo | ✅ Soporte completo |
| **Performance** | Buena | ✅ Excelente |
| **Angular 21+** | Legacy | ✅ Moderno |
| **Type Safety** | Parcial | ✅ Completo |
| **Bundle Size** | ~15KB | ✅ ~8KB |
| **Mantenimiento** | Activo | ✅ Muy activo |

### ¿Por qué @jsverse/transloco?

#### Ventajas
- **Signals First** - Diseñado para Angular moderno
- **Performance Superior** - Optimizado para Zoneless
- **Type Safety Completo** - Inferencia perfecta
- **Modern Architecture** - Compatible con Angular 21+
- **Active Development** - Actualizaciones constantes

#### Para este Proyecto
- **PWA Moderna** - Compatible con nuestro stack
- **Reactividad Signals** - Integración perfecta
- **Performance** - Ideal para aplicaciones offline
- **Future-Proof** - Dirección de Angular

### Mejores Prácticas con ngModel

#### 1. Inicialización Correcta
```typescript
// ✅ Forma correcta - funciona perfectamente
selectedLang = this.getInitialLanguage(); // Lee localStorage antes del renderizado

// ❌ Forma incorrecta - race condition
currentLang = toSignal(this.translocoService.langChanges$); // Muestra idioma incorrecto
```

#### 2. Nombres de Idioma en Idioma Nativo
```typescript
// ✅ Siempre mostrar en su idioma
{ code: AvailableLangs.ES, name: 'Español', flag: '🇪🇸' }
{ code: AvailableLangs.EN, name: 'English', flag: '🇬🇧' }
{ code: AvailableLangs.PT, name: 'Português', flag: '🇵🇹' }
```

#### 3. Binding Bidireccional
```html
<!-- ✅ Template con ngModel - funciona perfectamente -->
<select [(ngModel)]="selectedLang" (ngModelChange)="onLanguageChange($event)">
  <option [value]="lang.code">{{ lang.flag }} {{ lang.name }}</option>
</select>
```

### Conclusión

**@jsverse/transloco + ngModel** proporciona:

- **Solución funcional** para selectores de idioma
- **Performance superior** para PWAs
- **Type safety completo** 
- **Integración perfecta** con Angular 21+
- **Experiencia de usuario** excepcional

**Resultado:** Sistema multiidioma simple, funcional y optimizado para PWAs.

**Lección aprendida:** Para casos simples como selectores de idioma, ngModel es superior a signals porque elimina las race conditions de inicialización.

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









