## Documentacion oficial de Angular ##: 
https://angular.dev/
https://angular.dev/installation

## INSTALAR Node.js ##

Instalar NVM for windows y despues en consola (PowerShell como administrador)

nvm install latest
nvm install 20.19.6 //Versión estable y compatible con Angular 21
nvm install lts //Ultima versión LTS (Long Term Support) más estable

### Listar las versiones instaladas ###

nvm list

### Utilizar la version concreta ###

nvm use [version]

## INSTALAR Angular ##

npm install -g @angular/cli

### Comprobar la version de angular ###

ng version

## CREAR PROYECTO ANGULAR ##

ng new [nombre-proyecto] -t --prefix [prefijo] --routing
//--prefix Crea el proyecto con el prefijo [prefijo]- para los componentes. Es recomendable para evitar colisiones de nombres
//--routing Crea el proyecto con el sistema de rutas de Angular

## LANZAR PROYECTO ##

ng serve

## CREAR COMPONENTE ##

ng generate component [nombre-componente]
ng g c [nombre-componente]

## AÑADIR RUTAS en app.routes.ts ##

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

### RouterLink en el componente ###  
import { RouterLink } from '@angular/router';

@Component({
  selector: 'form-details',
  imports: [RouterLink],
  template: `
    <h1>Details</h1>
    <a [routerLink]="['/list']" queryParamsHandling="preserve">Back</a>
  `
})

### withComponentInputBinding en app.config.ts ###
Si vamos a usar rutas por ejemplo para un details que recibe en la url un id o name,
Podemos usar withComponentInputBinding en app.config.ts para que convierta automáticamente los parámetros de la ruta en inputs del componente

#### app.config.ts ####
provideRouter(routes, withComponentInputBinding())

#### Componente details ####
readonly id = input<string>();

## CREAR SERVICIO ##

ng generate service [nombre-servicio]
ng g s [nombre-servicio]

## CREAR PIPE ##

ng generate pipe [nombre-pipe]
ng g p [nombre-pipe]

## CREAR LOADER ##

ng generate c [nombre-loader]
ng g c [nombre-loader] 

## CREAR PWA ##

ng add @angular/pwa
ng add @angular/pwa --project [nombre-proyecto]

### Configurar el service worker ###

#### ngsw-config.json ####
En el archivo `ngsw-config.json` se configuran las opciones del service worker.

"updateMode": "prefetch" 

#### app.config.ts ####

provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),           // Solo en producción
  registrationStrategy: 'registerWhenStable:30000'  // 30s después de estabilizar
})

#### Probar el PWA ####

##### 1. Build inicial #####
```bash
ng build --configuration production
```

##### 2. Servir #####
```bash
npx serve dist/Angular.PWA.OfflineForm/browser -p 4200
```

##### 3. Testing inicial #####
```bash
http://localhost:4200
DevTools → Application → Offline → Marcar "Offline"
```

##### 4. Simular actualización #####
```bash
# a) Detener servidor (Ctrl+C)
# b) Modificar código 
# c) ng build --configuration production
```

##### 5. Ponerse online ANTES de recargar #####
```bash
DevTools → Application → Offline → Desmarcar "Offline"
```

##### 6. Recargar para que el service worker detecte la nueva versión #####
```bash
F5
```

##### 7. Esperar actualización #####
```bash
# Esperar 30 segundos (por que en app.config.ts se configuro con registerWhenStable:30000) → Banner UpdateNotification debería aparecer
# Click "Actualizar" → App recargada con el cambio realizado
```







